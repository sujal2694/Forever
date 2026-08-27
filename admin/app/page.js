"use client"
import LoginScreen from "./components/LoginScreen";
import { useContext, useEffect, useState } from "react";
import { Context } from "./context/Context";
import HomePage from "./pages/HomePage";
import { Toaster } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const { token } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  },[])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className={'size-8'}/>
      </div>
    )
  }
  
  return (
    <>
      {token
        ? (
          <div className="w-screen min-h-screen">
            <HomePage />
          </div>
        ) : (
          <LoginScreen />
        )}
        <Toaster/>
    </>
  );
}
