import { useEffect, useState } from "react";
import { Button, TableContainer, TextField } from "@mui/material";
import { useRouter } from "next/router";
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DoorBack from '@mui/icons-material/DoorBackOutlined';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AppBar from '../components/AppBar';
import Drawer from "../components/Drawer";

const mdTheme = createTheme();

export default function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [userAccount, setUserAccount] = useState('');
    const [currentChainId, setCurrentChainId] = useState('');
    const [userBalance, setUserBalance] = useState('')
    const [transactionHistory, setTransactionHistory] = useState([])
    const [open, setOpen] = useState(true);
    const router = useRouter()

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const bootstrap = (userAccount) => {
        ethereum.request({ method: 'eth_getBalance', params: [userAccount, 'latest'] }).then(balance => {
            setUserBalance(Number(balance) * 1e-18)
        });

        ethereum.request({ method: 'eth_chainId' }).then(chainId => {
            setCurrentChainId(chainId)
        });

        ethereum.request({ method: 'eth_getBlockByNumber', params: ['latest', true] }).then(async (block) => {
            const uniqueHashes = [...new Set(block.transactions.map(tx => tx.hash))]

            setTransactionHistory(uniqueHashes)
        });
    }

    useEffect(() => {
        if (initialized) return
        setInitialized(true)
        const userAccount = sessionStorage.getItem('userAccount');
        if (!userAccount) {
            router.push('/')
            return;
        }

        ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            setUserAccount(accounts[0])
            setIsAuthenticated(true)
            bootstrap(accounts[0])

            ethereum.on('accountsChanged', async function (accounts) {
                setUserAccount(accounts[0])
                await sessionStorage.setItem('userAccount', accounts[0])
                bootstrap(accounts[0])
            });

            ethereum.on('chainChanged', async function (chainId) {
                setCurrentChainId(chainId)
            });
        });

    }, [])


    const handleLogout = () => {
        sessionStorage.removeItem('userAccount')
        router.push('/')
    }

    const handleSendTransaction = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const to = formData.get('to')
        const amount = formData.get('amount')
        const gasPrice = '0x3b9aca00'
        const amountHex = (amount * 1e18).toString(16)

        const tx = {
            from: userAccount,
            to: to,
            value: amountHex,
            gasPrice: gasPrice,
        }

        await ethereum.request({ method: 'eth_sendTransaction', params: [tx] }).then(txHash => {
            bootstrap(userAccount)
        });
    }


    return (
        <ThemeProvider theme={mdTheme}>
            {isAuthenticated ? (
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />

                    <AppBar
                        open={open}
                        position="absolute">
                        <Toolbar
                            sx={{
                                pr: '24px', // keep right padding when drawer closed
                            }}
                        >
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="open drawer"
                                onClick={toggleDrawer}
                                sx={{
                                    marginRight: '36px',
                                    ...(open && { display: 'none' }),
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                component="h1"
                                variant="h6"
                                color="inherit"
                                noWrap
                                sx={{ flexGrow: 1 }}
                            >
                                Wallet: {userAccount}
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Drawer variant="permanent" open={open}>
                        <Toolbar
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                px: [1],
                            }}
                        >
                            <IconButton onClick={toggleDrawer}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </Toolbar>
                        <Divider />
                        <List component="nav">
                            <ListItemButton onClick={() => handleLogout()}>
                                <ListItemIcon>
                                    <DoorBack />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </List>
                    </Drawer>

                    <Box
                        component="main"
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'light'
                                    ? theme.palette.grey[100]
                                    : theme.palette.grey[900],
                            flexGrow: 1,
                            height: '100vh',
                            flexBasis: 0,
                            overflow: 'auto',
                            width: '100%',
                        }}
                    >
                        <Toolbar />

                        {currentChainId != '0x4' ? 
                        (<Typography variant="h4" gutterBottom>Invalid chain, please switch to rinkeby</Typography>) 
                        : 
                        (
                            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6} lg={6}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Typography component="h2" variant="h4" gutterBottom>
                                            Balance: {userBalance}
                                            </Typography>

                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={6} lg={6}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <Typography component="h2" variant="h6" gutterBottom>
                                            Send Funds
                                            </Typography>
                                            <form onSubmit={handleSendTransaction}>
                                                <TextField
                                                    id="to"
                                                    name="to"
                                                    label="To"
                                                    fullWidth
                                                    margin="normal"
                                                    variant="outlined"
                                                    ></TextField>
                                                <TextField
                                                    id="amount"
                                                    name="amount"
                                                    label="Amount"
                                                    fullWidth
                                                    margin="normal"
                                                    variant="outlined"
                                                    ></TextField>
                                                <Button
                                                    type="submit"
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    sx={{ mt: 2 }}
                                                >Send</Button>
                                            </form>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                            <Typography component="h2" variant="h6" gutterBottom>Transaction History</Typography>
                                            <TableContainer sx={{ maxHeight: '30vh' }}>
                                                <Table stickyHeader size="small" sx={{
                                                    height: 'max-content',
                                                }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Hash</TableCell>
                                                            <TableCell>Etherscan URL</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {transactionHistory.map(tx => (
                                                            <TableRow key={tx}>
                                                                <TableCell>{tx}</TableCell>
                                                                <TableCell><Link href={`https://rinkeby.etherscan.io/tx/${tx}`}>URL</Link></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Container>
                        )}
                    </Box>
                </Box>
            ) : (
                <div>
                    <p>You are not authenticated</p>
                </div>
            )}
        </ThemeProvider>
    );
}