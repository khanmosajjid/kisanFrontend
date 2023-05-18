import 'bootstrap/dist/css/bootstrap.css'
import '../styles/globals.css'
// import {Head } from 'next/document'
import Head from "next/head";
import Script from "next/script"
import Header from '../components/Header';


function MyApp({ Component, pageProps }) {
  return(<>    

<Head>
<title>Kissan Global Network</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1"
    crossOrigin="anonymous" 
  />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
<link href="https://fonts.googleapis.com/css2?family=Sen:wght@400;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/src/css/main.css" />
</Head>  

<Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js"
integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW"
crossOrigin="anonymous"/>  
  <Header/>
  <Component {...pageProps} />
  
  </>)
}

export default MyApp
