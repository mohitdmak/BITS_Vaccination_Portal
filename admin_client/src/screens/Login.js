import React, { useState } from 'react'
import { useHistory } from "react-router-dom";

import {
    Flex,
    Box,
    Text,
    Heading,
    Button,
    FormControl,
    FormLabel,
    Input,
} from '@chakra-ui/react'

import {
    Link,
} from "react-router-dom";

const Login = (props) => {
    const history = useHistory();
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const handleSubmit = event => {
        event.preventDefault();
        console.log("fetching now")
        fetch('https://vaccination.bits-dvm.org/api/admin/login', { // Your POST endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_username: username,
                client_password: password,
            })
        })
            .then(response => response.json())
            .then(res => {
                console.log(res)
                if (res.jwt) {
                    localStorage.setItem('jwt', res.jwt)
                    window.location.reload()
                    return 0
                }
                console.log(res)
                return alert(res.error)
            })
            .catch(err => console.log(err))
    };

    return (
        <>
            {/* <Flex alignItems="center" flexDir="column" >
            <Flex width="80vw" height="80vh" alignItems="center" flexDir="column" justifyContent="center">
                <Heading fontSize="24px" fontWeight="bold" mb="20px">BITS Vaccination Admin Portal</Heading>
                <Button 
                    onClick={() => window.open("https://vaccination.bits-dvm.org/cms/api/auth", "_parent")}
                >Login with BITS Mail</Button>
                <Text mt="20px">Made with ❤️ by DVM</Text>
            </Flex>
        </Flex> */}
            <Heading align="center" mt={50} mb={100}>BITS Vaccination Portal Admin</Heading>

            <Flex width="full" align="center" justifyContent="center">
                <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Box textAlign="center">
                        <Heading>Login</Heading>
                    </Box>
                    <Box my={4} textAlign="left">
                        <form onSubmit={handleSubmit}>
                            <FormControl isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input
                                    type="text"
                                    placeholder="Username"
                                    size="lg"
                                    onChange={event => setUsername(event.currentTarget.value)}
                                />
                            </FormControl>
                            <FormControl isRequired mt={6}>
                                <FormLabel>Password</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="*******"
                                    size="lg"
                                    onChange={event => setPassword(event.currentTarget.value)}
                                />
                            </FormControl>
                            <Button
                                variantColor="teal"
                                variant="outline"
                                type="submit"
                                width="full"
                                mt={4}
                            >
                                Sign In
                            </Button>
                        </form>
                    </Box>
                </Box>
            </Flex>
        </>
    )
}

export default Login;