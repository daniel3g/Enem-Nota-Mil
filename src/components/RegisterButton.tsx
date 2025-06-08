import React from "react";
import Link from "next/link";

const RegisterButton = ({ 
  href = "/cadastro", 
  backgroundColor = "bg-customPurple", 
  textColor = "text-white", 
  children = "Matricule-se Agora!" 
}) => {
  return (
    <Link href={href}>
      <button className={`flex items-center justify-center px-8 py-2 ${backgroundColor} ${textColor} rounded-3xl hover:opacity-80 transition`}>
        {children}
      </button>
    </Link>
  );
};

export default RegisterButton;

