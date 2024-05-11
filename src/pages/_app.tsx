import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css"; 
import { ToastContainer } from "react-toastify"; 
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={5000}     
        hideProgressBar={false} 
        newestOnTop={false}  
        closeOnClick         
        rtl={false}          
        pauseOnFocusLoss     
        draggable            
        pauseOnHover         
      />
      <Component {...pageProps} />
    </>
  );
}
