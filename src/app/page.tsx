"use client";
import {useForm} from "react-hook-form";
import {useState} from "react";
import {CardTitle, CardDescription, CardHeader, CardContent, Card} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import Index from "@/app/components/Editor";
import {Navbar} from "@/app/components/Navbar";

export default function Home() {
    const {register, handleSubmit} = useForm();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    return (
        <div className={"flex flex-col h-screen w-screen items-center justify-center"}>
            <Navbar/>
            {isLoggedIn ?
                <Index/>
                :
                <Card className="mx-auto max-w-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>Enter your email and password to login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit((data) => {
                            setIsLoggedIn(true);
                        })}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input {...register("email", {
                                        required: "This is required"
                                    })} id="email" placeholder="user@example.com" required type="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input {...register("password")} id="password" required type="password" minLength={5} />
                                </div>
                                <Button className="w-full" type="submit">
                                    Login
                                </Button>
                            </div>
                        </form>
                        <Button className="w-full mt-4" variant={"outline"} type="submit" onClick={() => { setIsLoggedIn(true) }}>
                            Skip Login
                        </Button>
                    </CardContent>
                </Card>
            }
        </div>
    )
};