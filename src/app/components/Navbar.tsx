"use client"
import * as React from "react"

import {cn} from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {ThemeToggler} from "@/app/components/ThemeToggler";
import {GitHubLogoIcon} from "@radix-ui/react-icons";

export function Navbar() {
    return (
        <NavigationMenu className={"absolute py-2 top-0 left-0 max-w-full w-full border-b-2 bg-card text-card-foreground shadow-sm mb-10"}>
            <div className={"flex px-4  max-w-full w-full justify-between items-center md:px-12"}>
                <a
                    rel={"noreferrer"}
                    target={"_blank"}
                    href="https://github.com/Yug34/image-editor"
                    className={navigationMenuTriggerStyle()}
                >
                    <GitHubLogoIcon className={"mr-2"}/>
                    Source Code
                </a>
                <ThemeToggler/>
            </div>
        </NavigationMenu>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({className, title, children, ...props}, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"