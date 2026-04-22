import React from 'react'
import { OrbitProgress } from "react-loading-indicators";

export default function Loading() {
  return (
    <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white/70 z-100'>
        <OrbitProgress dense color="#cdcdcd" size="medium" text="" textColor="" />
    </div>

  )
}
