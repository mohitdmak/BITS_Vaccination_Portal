import React from 'react-router'

import {
    Flex,
    Heading,
    Text,
    Image
} from '@chakra-ui/react'

import { Link } from 'react-router-dom'

const Devs = () => {
    return(
        <>
            <Flex 
                flexDir="column"
                alignItems="center"
                justifyContent="center"
                height="80vh"
            >
                <Heading margin="20px">Meet the Developers</Heading>
                <Flex
                    flexDir="row"
                    flexWrap="wrap"
                    justifyContent="center"
                    margin="20px"
                >
                    <a href="https://github.com/psrth/" target="_blank" rel="noreferrer">
                        <Flex flexDir="column" alignItems="center" justifyContent="center" margin="20px">
                            <Image src="https://avatars.githubusercontent.com/u/45586386?v=4" boxSize="100px" borderRadius="100%"></Image>
                            <Text fontWeight="bold">Parth Sharma</Text>
                            <Text color="blue">@psrth</Text>
                        </Flex>
                    </a>

                    <a href="https://github.com/mohitdmak/" target="_blank" rel="noreferrer">
                        <Flex flexDir="column" alignItems="center" justifyContent="center" margin="20px">
                            <Image src="https://avatars.githubusercontent.com/u/74651553?v=4" boxSize="100px" borderRadius="100%"></Image>
                            <Text fontWeight="bold">Mohit Makwana</Text>
                            <Text color="blue">@mohitdmak</Text>
                        </Flex>
                        </a>


                    <a href="https://github.com/nidheeshjain/" target="_blank" rel="noreferrer">
                    <Flex flexDir="column" alignItems="center" justifyContent="center" margin="20px">
                        <Image src="https://avatars.githubusercontent.com/u/46869788?v=4" boxSize="100px" borderRadius="100%"></Image>
                        <Text fontWeight="bold">Nidheesh Jain</Text>
                        <Text color="blue">@nidheeshjain</Text>
                    </Flex>
                    </a>

                    <a href="https://github.com/anshalshukla/" target="_blank" rel="noreferrer">
                    <Flex flexDir="column" alignItems="center" justifyContent="center" margin="20px">
                        <Image src="https://avatars.githubusercontent.com/u/53994948?v=4" boxSize="100px" borderRadius="100%"></Image>
                        <Text fontWeight="bold">Anshal Shukla</Text>
                        <Text color="blue">@anshalshulka</Text>
                    </Flex> </a>

                    <a href="https://github.com/" target="_blank" rel="noreferrer">
                    <Flex flexDir="column" alignItems="center" justifyContent="center" margin="20px">
                        <Image src="https://avatars.githubusercontent.com/u/22094689?v=4" boxSize="100px" borderRadius="100%"></Image>
                        <Text fontWeight="bold">Darsh Mishra</Text>
                        <Text color="blue">@darshmishra</Text>
                    </Flex> </a>

                </Flex>


            </Flex>
        </>
    )
}

export default Devs;