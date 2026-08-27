import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";


export default function Home() {
  return (
    <div>
      <Navbar/>
      <HomePage/>
      <ToastContainer/>
    </div>
  );
}
