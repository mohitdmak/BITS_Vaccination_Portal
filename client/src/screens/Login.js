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
                <Heading fontSize="24px" textAlign="center" fontWeight="bold" mt="200px" mb="20px">BITS Vaccination Status Portal</Heading>
                <Button 
                    padding="20px"
                    onClick={() => window.open("https://vaccination.bits-dvm.org/api/auth", "_parent")}
                >Login with BITS Mail</Button>
                <Text mt="20px">Made with ❤️  by DVM</Text>
                {/* <Text mt="20px" p="20px" width="400px" textAlign="center" color="red">Please note, only authorised BITS IDs (divisible by 3) will be allowed access during the beta testing period.</Text> */}
                <Link to="/devs">
                    <Text mt="20px" color="grey" mt="200px">Meet the Developers</Text>
                </Link>
            </Flex>
        </Flex>
        </>
    )
}

export default Login;
