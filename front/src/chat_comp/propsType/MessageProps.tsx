import React from "react";

type MessageProps = {
	key?:string | number,
	id?: string,
	class?: string,
	createdAt: any,
	username: string,
	message: string,
	admin?: 0 | 1 | 2
	builder?: string
}

export default MessageProps