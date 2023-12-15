import { useCurrentAccount } from "@mysten/dapp-kit";
import { Container, Flex, Text } from "@radix-ui/themes";
import {Game} from "./Game";
import './Game.css'; 

export function WalletStatus() {
  const account = useCurrentAccount();

  return (
    <Container my="2">
      {/* { <Heading mb="2">Wallet Status</Heading>

      {account ? (
        <Flex direction="column">
          <Text>Wallet connected</Text>
          <Text>Address: {account.address}</Text>
        </Flex>
      ) : (
        <Text>Wallet not connected</Text>
      )} } */
      
        account ? (
          <Flex direction="column">
          <Game/>
          </Flex>
        ) : (
          <Flex direction="column">
            <Text className="text-center">Wallet not connected</Text>
          </Flex>
          
        )
      }
      
    </Container>
  );
}
