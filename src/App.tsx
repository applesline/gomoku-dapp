import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";
import { createNetworkConfig,SuiClientProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from '@mysten/sui.js/client';


const { networkConfig}= createNetworkConfig({
	mainnet: {url: getFullnodeUrl("mainnet")},
	testnet: {url: getFullnodeUrl("testnet")},
	localnet: { url: getFullnodeUrl("localnet")}
});

function App() {
  return (
    <SuiClientProvider networks={networkConfig} network="mainnet">
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading></Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        {/* <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          
        </Container> */}
        <WalletStatus />
      </Container>
    	</SuiClientProvider>
  );
}

export default App;
