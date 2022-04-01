import { Flex, Heading, Link, Stack, Text, Box } from '@chakra-ui/layout'
import { Avatar, Button, IconButton, Input, SkeletonCircle, SkeletonText, Tooltip } from "@chakra-ui/react"
import { createClient } from '@supabase/supabase-js'
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FiGithub, FiUserX } from 'react-icons/fi'

const supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_API_KEY)

export default function Home() {

  const [lista, setLista] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const mensagemRef = useRef(null)
  const nomeRef = useRef(null)

  const skeleton = [1, 2, 3, 4, 5, 6, 7, 8, 9]

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
      justifyContent='center'
      alignItems='center'
      w='100%'
      h='100vh'
      paddingBottom='2%'
      paddingTop='1%'
    >
      <Stack
        w={['95%', '80%', '60%', '50%']}
        h='85%'
      >

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
          width='100%'
          minH='450px'
          marginBottom='20px'
          padding='4'
          overflow='auto'
          flexDirection='column-reverse'
        >
          {
            lista.length > 0 ? lista.map((item, id) => (

              <Stack
                key={id}
                w='50%'
                ml={item.nome == data?.user?.name ? 'auto' : ''}
              >
                <Stack
                  marginBottom='6px'
                  scroll-snap-align='end'
                  border='1px solid'
                  padding='8px'
                  bg='white'//item.nome == data?.user?.name ? 'end' : ''
                  borderRadius='10px'
                  shadow='2xl'
                >

                  <Flex
                    w='100%'
                    direction='column'
                    alignItems={item.nome == data?.user?.name ? 'end' : ''}
                    gap='2'
                  >
                    <Avatar
                      name='Dan Abrahmov'
                      src={item.avatar ? item.avatar : 'https://bit.ly/dan-abramov'}
                    />
                    <Text
                      fontSize='12px'
                      color='#000'
                    >
                      {item.nome}
                    </Text>
                    <Text
                      fontSize='12px'
                      color='#000'
                    >
                      {item.mensagem}
                    </Text>
                    <Text
                      fontSize='10px'
                      color='gray.400'
                    >
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </Flex>

                </Stack>

              </Stack>
            ))
              :
              skeleton.map(item =>
                <>
                  <Box padding='6' boxShadow='lg' bg='white' mb='4' borderRadius='10' w='50%'>
                    <SkeletonCircle size='10' />
                    <SkeletonText mt='4' noOfLines={3} spacing='4' />
                  </Box>
                </>
              )

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
                <Text textAlign='center' fontSize='18px' color='white'>Logar para usar o chat !</Text>
                <Text textAlign='center' fontSize='18px' color='white'>Utilize umas das redes abaixo para continuar !</Text>
                <Stack direction='row' w='100%'>

                  <Tooltip hasArrow label='Google' bg='gray.300' color='black'>
                    <IconButton
                      aria-label='Login com Google'
                      icon={<FcGoogle size={30} />}
                      bg='white'
                      size='lg'
                      isLoading={loadingLogin}
                      onClick={() => {
                        setLoadingLogin(true)
                        signIn('google')
                      }}
                      w='100%'
                    />
                  </Tooltip>

                  <Tooltip hasArrow label='GitHub' bg='gray.300' color='black'>
                    <IconButton
                      aria-label='Login com Github'
                      icon={<FiGithub size={30} />}
                      colorScheme={'purple'}
                      size='lg'
                      isLoading={loadingLogin}
                      onClick={() => {
                        setLoadingLogin(true),
                          signIn('github')
                      }}
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
                    placeholder="Mensagem"
                    required
                    bg='white'
                    color='black'
                    maxLength={'120'}
                    h='48px'
                  />
                  <Button
                    type='submit'
                    colorScheme="teal"
                    size="lg"
                    ref={mensagemRef}
                    isLoading={loading}
                    h='48px'
                  >
                    Enviar mensagem
                  </Button>
                </Stack>

                <Link ml='auto' mt='4' color='white' onClick={signOut} >
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
