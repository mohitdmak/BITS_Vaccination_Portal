import { React } from 'react'

import {
    Flex,
    Box,
    Text,
    Heading,
    Button
} from '@chakra-ui/react'

import {
    Link,
  } from "react-router-dom";

const Login = (props) => {
    return (
        <>
        <Flex alignItems="center" flexDir="column" >
            <Flex width="80vw" height="80vh" alignItems="center" flexDir="column" justifyContent="center">
                <Heading fontSize="24px" fontWeight="bold" mt="200px" mb="20px">BITS Vaccination Status Portal</Heading>
                <Button 
                    onClick={() => window.open("https://vaccination.bits-dvm.org/api/auth", "_parent")}
                >Login with BITS Mail</Button>
                <Text mt="20px">Made with ❤️  by DVM</Text>
                <Link to="/devs">
                    <Text mt="20px" color="grey" mt="200px">Meet the Developers</Text>
                </Link>
            </Flex>
        </Flex>
        </>
    )
}

export default Login;
