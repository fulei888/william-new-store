import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';


const reducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_REQUEST':
        return { ...state, loading: true };
      case 'FETCH_SUCCESS':
        return {
          ...state,
          products: action.payload.products,
          page: action.payload.page,
          pages: action.payload.pages,
          loading: false,
        };
      case 'FETCH_FAIL':
        return { ...state, loading: false, error: action.payload };
      case 'CREATE_REQUEST':
        return { ...state, loadingCreate: true };
      case 'CREATE_SUCCESS':
        return {
          ...state,
          loadingCreate: false,
        };
      case 'CREATE_FAIL':
        return { ...state, loadingCreate: false };
  
      case 'DELETE_REQUEST':
        return { ...state, loadingDelete: true, successDelete: false };
      case 'DELETE_SUCCESS':
        return {
          ...state,
          loadingDelete: false,
          successDelete: true,
        };
      case 'DELETE_FAIL':
        return { ...state, loadingDelete: false, successDelete: false };
  
      case 'DELETE_RESET':
        return { ...state, loadingDelete: false, successDelete: false };
      default:
        return state;
    }
  };

export default function ProductListScreen() {
  const navigate = useNavigate();
    const [{
        loading,
        error,
        products,
        pages,
        loadingCreate,
        loadingDelete,
        successDelete,
    }, dispatch] = useReducer(reducer, {
        loading: true,
        error:''
    })
    const {search} = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;

    const {state} = useContext(Store);
    const {userInfo} = state;
    useEffect(()=> {
        const fetchData = async () => {
            try{
                const {data} = await axios.get(
                    `/api/products/admin?page=${page}`,
                    {
                        headers: {Authorization: `Bearer ${userInfo.token}`}
                    }
                )
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            }
            catch (err) {

            }
        }
        fetchData();
    },[page, userInfo])
    const createHandler = async() => {
      if(window.confirm('Are you sure to create?')) {
        dispatch({type:'CREATE_REQUEST'});
        try{
          const {data} = await axios.post(
            '/api/products',{},
            {
                headers: {Authorization: `Bearer ${userInfo.token}`}
            }
        )
        dispatch({ type: 'CREATE_SUCCESS', payload: data });
        navigate(`/admin/products/${data.product._id}`);
        }
        catch(err) {
          toast.error(getError(error));
          dispatch({
            type: 'CREATE_FAIL'
          })
        }
      }
    }
    const editHandler =(id) => {
      navigate(`/admin/products/${id}`);
    }
  return (
    <div>
      <Row>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick = {createHandler}>
              Create A Product
            </Button>
          </div>
        </Col>
      </Row>
        {loading? (
            <LoadingBox></LoadingBox>
        ): error? <MessageBox variant="danger">{error}</MessageBox>
        :(
        <>
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {products.map(product => (
                    <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.category}</td>
                        <td>{product.brand}</td>
                        <td><Button type="button" variant ="light" onClick={()=>editHandler(product._id)}>Edit</Button></td>
                    </tr>
                ))}
            </tbody>
            </table>
            <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>)
    }
    </div>
  )
}
