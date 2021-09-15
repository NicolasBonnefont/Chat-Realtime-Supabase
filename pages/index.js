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
  const [loading, setLoading] = useState(false)
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
    setLoading(true)
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
    setLoading(false)
  }

  return (
    <Flex
      bg='teal.900'
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
          color='teal.100'
        >Chat da Discórdia ! 🤓😈</Heading>
        <Flex

          height='460px'
          width='400px'
          marginBottom='20px'
          padding='2px'
          overflow='auto'
          flexDirection='column-reverse'
          bg='teal.900'
        >
          {
            lista.map((item, id) => (
              <Stack key={id}
                marginBottom='6px'
                scroll-snap-align='end'
                border='1px solid'
                padding='8px'
                bg='teal.100'
                borderTopLeftRadius='18px'
                borderBottomLeftRadius='18px'
              >
                <Text color='#000'>Usuário: {item.nome}</Text>
                <Text color='#000'>Mensagem: {item.mensagem}</Text>
                <Text ml='auto' fontSize='10px' color='#000'>{new Date(item.updated_at).toLocaleString()}</Text>
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
              isLoading={loading}
            >
              Enviar mensagem
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}
