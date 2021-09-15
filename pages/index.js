import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/layout'
import { Input } from "@chakra-ui/react"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { Button } from "@chakra-ui/react"

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

    }

    CarregaChat()

    supabase
      .from('chat')
      .on('*', payload => {
        setLista((e) => [...e, payload.new].reverse())
      })
      .subscribe()

    if (localStorage.getItem('nome') === null || localStorage.getItem('nome') === '') {
      nomeRef.current.disabled = false
    } else {
      nomeRef.current.disabled = true
      setNome(localStorage.getItem('nome'))
    }

  }, [])

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
      <Stack>
        <Heading
          ml='auto'
          mr='auto'
          fontSize='2xl'
          mb='2'
        >Chat da Discórdia ! 🤓😈</Heading>
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
              </Stack>
            ))
          }

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
