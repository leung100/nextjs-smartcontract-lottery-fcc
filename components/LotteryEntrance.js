import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)

    console.log(`ChainId is ${chainId}`)

    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specify networkId
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specify networkId
        functionName: "getEntranceFee",
        params: {},
    })
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specify networkId
        functionName: "getRecentWinner",
        params: {},
    })
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specify networkId
        functionName: "getNumberOfPlayers",
        params: {},
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            async function updateUi() {
                const entranceFeeFromCall = (await getEntranceFee()).toString()
                const numPLayersFromCall = (await getNumberOfPlayers()).toString()
                const recentWinnerFromCall = await getRecentWinner()

                setEntranceFee(entranceFeeFromCall)
                setNumPlayers(numPLayersFromCall)
                setRecentWinner(recentWinnerFromCall)

                console.log(entranceFee)
            }
            updateUi()
        }
    }, [isWeb3Enabled])
    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
    }
    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            tittle: " Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            lottery entrance
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-boder h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter RAFFLE</div>
                        )}
                    </button>
                    <div>entrance fee : {ethers.utils.formatUnits(entranceFee, "ether")}</div>
                    <div>ETH Numbers of Players: {numPlayers}</div>
                    <div>recentWinner: {recentWinner}</div>
                </div>
            ) : (
                <div> No Raffle Addrress detected </div>
            )}
        </div>
    )
}
