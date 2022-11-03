import SceltaStanza from "./SceltaStanza"

export default function ChatMessageBody(props: any) {
    if (props.stanza && props.main) {
        return (
            <div id="conversazione" className={"conversazione" +
                (props.closed === "chiusa" && " chiuso")}>
                {
                    props.arrMessaggi.map(
                        (m: any) => (
                            <div className="messaggio assistente">
                                <span className="dettagli">25/08/2022 ore 13:25</span>
                                <span className="testo">{m.message}</span>
                            </div>
                        )
                    )}
            </div>
        )
                }
    else {
        //console.log(props.arr)
        return (
            <div id="list">
                {props.arr.map(function (item: string, id: number): any {
                        //console.log(item)
                        if (item.includes(props.src)) {
                            return <SceltaStanza key={id}
                                                 main={props.main}
                                                 id={id}
                                                 name={item}
                                                 setStanza={props.setStanza}
                                                 setGruppo={props.setGruppo}
                            />
                    }
                })}
            </div>
        )
    }
}