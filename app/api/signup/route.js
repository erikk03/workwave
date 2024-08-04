import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const {FirstName, LastName, Email, Phone, Password, ConfirmPassword} = await req.json();

        console.log("First Name: ", FirstName);
        console.log("Last Name: ", LastName);
        console.log("Email: ", Email);
        console.log("Phone: ", Phone);
        console.log("Password", Password);
        console.log("Confirm Password: ", ConfirmPassword);
        
        return NextResponse.json(
            {message: "User Signed up successfully"},
            {status: 201}
        );
    } catch (error) {
        return NextResponse.json(
            {message: "Error while signing up"},
            {status: 500}
        );
    }
}