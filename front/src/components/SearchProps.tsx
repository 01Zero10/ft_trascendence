import React from "react"
import { ChangeEventHandler } from "react"

type SearchProps = {
    id?: string,
    type?: string
    autoComplete?: string,
    placeholder?: string,
    class?: string,
    value?: string,
    handleChange: ChangeEventHandler<HTMLInputElement>,
}

export default SearchProps