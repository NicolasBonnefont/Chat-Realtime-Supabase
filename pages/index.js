import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/layout'
import { Input } from "@chakra-ui/react"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, ButtonGroup } from "@chakra-ui/react"
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react"
import { ArrowForwardIcon } from '@chakra-ui/icons'

// Create a single supabase client for interacting with your database 
const supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_API_KEY)

export default function Home() {

  const [lista, setLista] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [nome, setNome] = useState('')
  const mensagemRef = useRef(null)
  const nomeRef = useRef(null)

  useEffect(() => {
    async function CarregaChat() {
      const { data, error } = await supabase
        .from('chat')
        .select()
      setLista((e) => [...data].reverse())


      if (error) {
        console.log(error)
      }

      if (!("Notification" in navigator)) {
        console.log('Esse browser não suporta notificações desktop');
      } else {
        if (Notification.permission !== 'denied') {
          // Pede ao usuário para utilizar a Notificação Desktop
          await Notification.requestPermission();
        }
      }
    }

    CarregaChat()


    supabase
      .from('chat')
      .on('*', payload => {
        setLista((e) => [...e, payload.new].reverse())
        notify()

      })
      .subscribe()



    if (localStorage.getItem('nome') === null || localStorage.getItem('nome') === '') {
      nomeRef.current.disabled = false
    } else {
      nomeRef.current.disabled = true
      setNome(localStorage.getItem('nome'))
    }

  }, [])



  function notify() {
    if (!window.Notification) {
      console.log('Este browser não suporta Web Notifications!');
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission(function () {
        console.log('Usuário não falou se quer ou não notificações. Logo, o requestPermission pede a permissão pra ele.');
      });
    } else if (Notification.permission === 'granted') {
      console.log('Usuário deu permissão');

      var notification = new Notification('Nova Mensagem', {
        body: 'Mensagem do corpo da notificação',
        tag: 'string única que previne notificações duplicadas',
      });
      notification.onshow = function () {
        console.log('onshow: evento quando a notificação é exibida')
      },
        notification.onclick = function () {
          console.log('onclick: evento quando a notificação é clicada')
        },
        notification.onclose = function () {
          console.log('onclose: evento quando a notificação é fechada')
        },
        notification.onerror = function () {
          console.log('onerror: evento quando a notificação não pode ser exibida. É disparado quando a permissão é defualt ou denied')
        }

    } else if (Notification.permission === 'denied') {
      console.log('Usuário não deu permissão');
    }
  }
  async function enviarMensagem(e) {

    e.preventDefault()

    await supabase
      .from('chat')
      .insert([
        {
          mensagem: mensagem,
          nome: nome
        }
      ])
    setMensagem('')
    nomeRef.current.disabled = true
    mensagemRef.current.focus()
    localStorage.setItem('nome', nome)
  }

  return (
    <Flex
      bg='#eee'
      height='100vh'
      justifyContent='center'
      alignItems='center'
    >

      <Stack

      >
        <Heading
          ml='auto'
          mr='auto'
          fontSize='2xl'
          mb='2'
        >Chat da Discordia ! 🤓😈</Heading>
        <Flex
          border='1px solid'
          height='460px'
          width='400px'
          bg='white'
          borderRadius='1px'
          marginBottom='20px'
          padding='5px'
          overflow='auto'
          flexDirection='column-reverse'

        >

          {
            lista.map((item, id) => (
              <Stack key={id}
                marginBottom='10px'
                scroll-snap-align='end'
                border='1px solid'
                padding='5px'
                borderRadius='8px'


              >
                <Text color='#000'>Usuário: {item.nome}</Text>
                <Text color='#000'>Mensagem: {item.mensagem}</Text>
                <Text fontSize='10px' color='#000'>{new Date(item.updated_at).toLocaleString()}</Text>
                {/*  {console.log('teste', item)} */}
              </Stack>

            ))
          }

          {/* <Text color='#000'>{JSON.stringify(Listamensagem)}</Text> */}

        </Flex>
        <Box
          as='form'
          onSubmit={enviarMensagem}
        >
          <Stack >
            <Input
              variant="filled"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Informe seu nome"
              required
              ref={nomeRef}
            />
            <Input
              variant="filled"
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              placeholder="Informe sua mensagem"
              required
            />
            <Button
              type='submit'
              colorScheme="teal"
              size="lg"
              ref={mensagemRef}
            >
              Enviar mensagem
            </Button>
          </Stack>
        </Box>
      </Stack>


    </Flex>
  )
}
