"use client";
import {FieldValues, useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {CardTitle, CardDescription, CardHeader, CardContent, Card} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {redirect} from "next/navigation";
import Editor from "@/app/components/Editor";
import {ThemeToggler} from "@/app/components/ThemeToggler";
import {Navbar} from "@/app/components/Navbar";

export default function Home() {
    const {register, handleSubmit} = useForm();
    const [data, setData] = useState<FieldValues | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <>
            <Navbar/>
            {isLoggedIn ?
                <Editor/>
                :
                <Card className="mx-auto max-w-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>Enter your email and password to login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/*<form onSubmit={handleSubmit((data) => {*/}
                        {/*    setData(data);*/}
                        {/*    setIsLoggedIn(true);*/}
                        {/*})}>*/}
                        {/*    <div className="space-y-4">*/}
                        {/*        <div className="space-y-2">*/}
                        {/*            <Label htmlFor="email">Email</Label>*/}
                        {/*            <Input {...register("email")} id="email" placeholder="user@example.com" required type="email" />*/}
                        {/*        </div>*/}
                        {/*        <div className="space-y-2">*/}
                        {/*            <Label htmlFor="password">Password</Label>*/}
                        {/*            <Input {...register("password")} id="password" required type="password" />*/}
                        {/*        </div>*/}
                        {/*        <Button className="w-full" type="submit">*/}
                        {/*            Login*/}
                        {/*        </Button>*/}
                        {/*    </div>*/}
                        {/*</form>*/}
                        <button onClick={() => {
                            setIsLoggedIn(true);
                        }}>click
                        </button>
                    </CardContent>
                </Card>
            }
        </>
    )
}
