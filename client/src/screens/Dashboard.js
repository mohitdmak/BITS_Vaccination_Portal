import { React, useState, useEffect} from 'react'

import {
    Flex,
    Box,
    Text,
    Heading,
    GridItem,
    Grid,
    Image,
    Button,
} from '@chakra-ui/react'

import {
    Link,
} from "react-router-dom";


const Dashboard = (props) => {

    const [name, setName] = useState("Parth Sharma")
    const [pp, setPP] = useState("https://avatars.githubusercontent.com/u/45586386?v=4")
    const [certificate, setCertificate] = useState(null)
    const [consent, setConsent] = useState(null)


    const campus = "BITS Pilani, Pilani Campus"
    const bits = "https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/b4/20/40/b420401e-c883-b363-03b5-34509d67c214/source/512x512bb.jpg"
    const dvm = "https://avatars.githubusercontent.com/u/14038814?s=200&v=4"


    useEffect(() => {
        apiRequest();
    }, []); 
    
    const apiRequest = () => {
        fetch('https://vaccination.bits-dvm.org/api/student/details/',
                {   
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            ).then(response => 
                response.json().then(data => ({
                    data: data,
                    status: response.status
                })
            ).then(res => {
                if(res.data){
                    setName(res.data.name)
                    setPP(res.data.pic)
                    if (res.data.pdf){
                        setCertificate(res.data.pdf)
                    }
                    if (res.data.consentForm){
                        setConsent(res.data.consentForm)
                    }
                } else {
                    alert("ERROR RETRIEVING CONTENT.");
                }
            }))
    }

    return (
        <>
            <Flex 
                flexDir="column"
                alignItems="center"
                justifyContent="center"
            >
                {/* NAVBAR */}
                <Flex
                    mt="20px"
                    mb="20px"
                    flexDir="row"
                    width="80%"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    
                    <Heading 
                        fontSize={["18px", "18px", "18px", "24px", "24px"]}
                        color="#363636"
                    >Vaccination Status Portal
                    </Heading>
                    
                    
                        <Button 
                            bg="red" 
                            color="white"
                            fontWeight="bold"
                            fontSize={["12px", "12px", "12px", "18px", "18px"]}
                            onClick={() => window.open("https://vaccination.bits-dvm.org/api/auth/logout", "_parent")}
                        >Logout
                        </Button> 

                </Flex>
                {/* END NAVBAR */}


                <Flex 
                    flexDir={["column","column","column","row","row"]}
                    alignItems="center"
                    justifyContent="center"
                    width="80vw"
                >

                    {/* NAME CARD */}
                    <Box 
                        bg="#FAFAFA" 
                        borderRadius="10px"
                        m="20px"
                        p="30px"
                        width={["80vw", "80vw", "80vw", "500px", "500px"]}
                        height={["80px", "80px", "80px", "120px", "120px"]}
                        display="flex"
                        alignItems="center"
                    >
                       <Flex flexDir="row" alignItems="center">
                           <Image 
                                src={pp} 
                                mr="20px" 
                                boxSize={["50px", "50px", "50px", "80px", "80px"]}
                                borderRadius="100%"
                            />
                           <Flex flexDir="column">
                               <Heading 
                                    fontSize={["20px", "20px", "20px", "24px", "24px"]}
                                >{name}</Heading>
                               <Text 
                                    fontSize={["14px", "14px", "14px", "22px", "22px"]}
                                >{campus}</Text>
                           </Flex>
                       </Flex>
                    </Box>
                    
                    {/* STATUS CARD */}
                    <Box 
                        bg="#FAFAFA" 
                        borderRadius="10px"
                        p="30px"
                        ml="20px"
                        mr="20px"
                        width={["80vw", "80vw", "80vw", "500px", "500px"]}
                        height={["80px", "80px", "80px", "120px", "120px"]}
                        display="flex"
                        flexDir="column"
                        justifyContent="center"
                    >
                        <Flex flexDir="column">
                            <Text 
                                mb="-2px"
                                fontSize={["14px", "14px", "14px", "22px", "22px"]}
                            >VACCINATION STATUS</Text>
                            {certificate ? 
                                <Heading 
                                    color="green"
                                    fontSize={["20px", "20px", "20px", "28px", "28px"]}
                                >FULLY VACCINATED</Heading> : 
                                <Heading 
                                    color="red"
                                    fontSize={["20px", "20px", "20px", "28px", "28px"]}
                                >NOT VACCINATED</Heading>}
                        </Flex>
                    </Box>
                </Flex>
            
                <Grid 
                    templateColumns={["repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(6, 1fr)", "repeat(6, 1fr)"]}
                    bg="#FAFAFA"
                    mt="20px"
                    borderRadius="10px"
                    p="20px"
                    gap={6}
                    width={["80vw", "80vw", "80vw", "1040px", "1040px"]}
                >
                    {/* <Flex flexDir="row" m="10px" alignItems="center"> */}
                    <GridItem rowSpan={1} colSpan={2}>
                        <Text fontWeight="bold">Latest Vaccine Certificate:</Text>
                    </GridItem>
                       
                    <GridItem rowSpan={1} colSpan={1}>
                        <Button 
                            ml="10px" 
                            mr="10px"
                            isDisabled={certificate ? false : true}
                            onClick={() => window.open(certificate, "_blank")}
                        >View</Button>
                    </GridItem>
                    
                    <GridItem rowSpan={1} colSpan={3}>
                        <form action="https://vaccination.bits-dvm.org/api/student/post_pdf" method="post">
                            <input type="file" key="pdf" />
                            <Button type="submit">Update</Button>
                        </form>
                    </GridItem>
                    
                    <GridItem rowSpan={1} colSpan={2} mt="10px">
                        <Text fontWeight="bold" mt="20px">Parent Consent Form:</Text>
                    </GridItem>

                    <GridItem rowSpan={1} colSpan={1}>
                        <Button 
                        isDisabled={consent ? false : true}
                        onClick={() => window.open(consent, "_blank")}
                        ml="10px" mr="10px" mt="20px"
                        >View</Button>
                    </GridItem>

                    <GridItem rowSpan={1} colSpan={3} mt="20px">
                        <form action="https://vaccination.bits-dvm.org/api/student/post_consentForm" method="post">
                            <input type="file" key="consentForm"  />
                            <Button type="submit">Update</Button>
                        </form>
                    </GridItem>
                    {/* </Flex> */}
                </Grid>

                <Flex 
                 flexDir={["column","column","column","row","row"]}
                alignItems="center" mt="100px">
                    An initiative by
                    <Image src={bits} ml="10px" mr="5px" mt="5px" height="80px" />
                    and
                    <Image src={dvm} ml="20px" mr="20px" mt="10px" boxSize="70px" />
                </Flex>
                
            </Flex>   
           
        </>
    )
}

export default Dashboard;
