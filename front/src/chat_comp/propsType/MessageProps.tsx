import React from "react";

type MessageProps = {
	key?:string | number,
	id?: string,
	class?: string,
	createdAt: any,
	username: string,
	message: string,
	admin?: boolean
	builder?: string
}

export default MessageProps