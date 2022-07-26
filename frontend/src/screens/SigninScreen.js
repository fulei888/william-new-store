import {useEffect, useState} from 'react';
import {Store} from '../Store';
import {useContext} from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import {Link, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import {getError} from '../utils';
export default function SigninScreen() {
    const navigate = useNavigate();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const {state, dispatch: ctxDispatch} = useContext(Store);
    const {userInfo} = state;
    const {search} = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl? redirectInUrl:'/';
    const submitHandler = async (e)=> {
        e.preventDefault();
        try {
            const {data} = await axios.post('/api/users/signin', {
                email,
                password,
            })
           
            ctxDispatch({type:'USER_SIGNIN', payload: data});
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate(redirect|| '/');
        } catch (err){
           
            //toast.error(err.response.data.message);
            toast.error(getError(err));
        }
        
    }
    useEffect(()=> {
        if(userInfo) {
            navigate(redirect);
        }
    },[navigate, redirect, userInfo]);
    return(
        <Container className="small-container">
            <Helmet>
                <title>Sign In</title>
            </Helmet>
            <h1 className="mb-3">Sign In</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" required onChange={(e)=>setEmail(e.target.value)}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" required onChange={(e)=>setPassword(e.target.value)}/>
                </Form.Group>
                <div className="mb-3">
                    <Button type="submit">Sign In</Button>
                </div>
                <div className="mb-3">
                    New Customer?{' '}
                    <Link to= {`/signup?redirect=${redirect}`}>Create your account</Link>
                </div>
            </Form>
        </Container>
    )
}