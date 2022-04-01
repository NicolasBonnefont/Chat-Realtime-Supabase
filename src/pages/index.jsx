import { Box, Flex, Heading, Stack, Text, Link } from '@chakra-ui/layout'
import { IconButton, Input, Tooltip } from "@chakra-ui/react"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { Button } from "@chakra-ui/react"
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { FiGithub, FiUserX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Avatar, AvatarBadge, AvatarGroup } from '@chakra-ui/react'

const supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_API_KEY)

export default function Home() {

  const [lista, setLista] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const mensagemRef = useRef(null)
  const nomeRef = useRef(null)

  const { data, status } = useSession()

  useEffect(() => {

    CarregaChat()

    supabase
      .from('chat')
      .on('*', payload => {
        CarregaChat()
      })
      .subscribe()


  }, [])
  async function CarregaChat() {

    const { data, error } = await supabase
      .from('chat')
      .select()

    console.log(data)

    if (data) {
      setLista((e) => [...data].reverse())
      return
    }


    if (error) {
      console.log(error)
    }

  }
  async function enviarMensagem(e) {

    e.preventDefault()
    setLoading(true)
    await supabase
      .from('chat')
      .insert([
        {
          mensagem: mensagem,
          nome: data.user.name,
          avatar: data.user.image
        }
      ])
    setMensagem('')
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
          color='white'
        >
          Chat da Discórdia ! 🤓😈
        </Heading>

        <Flex
          bg='green.200'
          shadow='2xl'
          borderRadius='2xl'
          height='400px'
          width='520px'
          marginBottom='20px'
          padding='4'
          overflow='auto'
          flexDirection='column-reverse'
        >
          {
            lista.length > 0 && lista.map((item, id) => (
              <Stack key={id}>
                <Stack
                  marginBottom='6px'
                  scroll-snap-align='end'
                  border='1px solid'
                  padding='8px'
                  bg='white'
                  borderTopLeftRadius='18px'
                  borderBottomLeftRadius='18px'
                >
                  <Avatar
                    name='Dan Abrahmov'
                    src={item.avatar ? item.avatar : 'https://bit.ly/dan-abramov'}

                  />
                  <Text fontSize='12px' color='#000'>Usuário: {item.nome}</Text>
                  <Text fontSize='12px' color='#000'>Mensagem: {item.mensagem}</Text>
                  <Text ml='auto' fontSize='10px' color='#000'>{new Date(item.created_at).toLocaleString()}</Text>
                </Stack>

              </Stack>
            ))
          }

        </Flex>
        <Flex
          as='form'
          onSubmit={enviarMensagem}
          justifyContent='center'
          direction='column'
        >
          {
            !data ?
              <Flex w='100%' direction='column' gap='4'>
                <Text textAlign='center' fontSize='18px' color='white'>Logar para par usar o chat !</Text>
                <Text textAlign='center' fontSize='18px' color='white'>Utilize umas das redes abaixo para continuar !</Text>
                <Stack direction='row' w='100%'>

                <Tooltip hasArrow label='Google' bg='gray.300' color='black'>
                  <IconButton
                    aria-label='Login com Google'
                    icon={<FcGoogle size={30} />}
                    bg='white'
                    size='lg'
                    onClick={() => signIn('google')}
                    w='100%'
                  />
                  </Tooltip>

                  <Tooltip hasArrow label='GitHub' bg='gray.300' color='black'>
                  <IconButton
                    aria-label='Login com Github'
                    icon={<FiGithub size={30} />}
                    colorScheme={'purple'}
                    size='lg'
                    onClick={() => signIn('github')}
                    w='100%'
                  />
                  </Tooltip>


                </Stack>
              </Flex>
              :
              <>
                <Stack w='100%' direction='column'>
                  <Input
                    variant=""
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    placeholder="Informe sua mensagem"
                    required
                    bg='white'
                    color='black'
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

                <Link ml='auto' mt='4' color='red.400' onClick={signOut} >
                  <Stack direction='row' alignItems='center'>
                    <Text >Deslogar</Text>
                    <FiUserX />
                  </Stack>
                </Link>

              </>
          }

        </Flex>
      </Stack>
    </Flex>
  )
}
