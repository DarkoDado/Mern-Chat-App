import { useCallback, useContext, useEffect, useState } from 'react'
import { uniqBy } from 'lodash'
import { BsFillSendPlusFill } from 'react-icons/bs'
import { UserContext } from './UserContext.jsx'
import Avatar from './Avatar'
import Logo from './Logo'

export default function Chat() {
  const [ws, setWs] = useState(null)
  const [onlinePeople, setOnlinePeople] = useState({})
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [newMessageText, setNewMessageText] = useState('')
  const [messages, setMessages] = useState([])
  const { username, id } = useContext(UserContext)

  // const handleMessage = useCallback((e) => {
  //   const messageData = JSON.parse(e.data)
  //   console.log(messageData, e)
  //   if ('online' in messageData) {
  //     showOnlinePeople(messageData.online)
  //   } else if ('text' in messageData) {
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         ...messageData.text,
  //       },
  //     ])
  //   }
  // }, [])

  useEffect(() => {
    function handleMessage(ev) {
      const messageData = JSON.parse(ev.data)
      console.log({ ev, messageData })
      if ('online' in messageData) {
        showOnlinePeople(messageData.online)
      } else if ('text' in messageData) {
        setMessages((prev) => [...prev, { isOur: false, text: messageData.text }])
      }
    }
    const ws = new WebSocket('ws://localhost:4000')
    setWs(ws)

    ws.addEventListener('message', handleMessage)
  }, [selectedUserId])

  function showOnlinePeople(peopleArray) {
    const people = {}
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username
    })
    setOnlinePeople(people)
  }

  function sendMessage(e) {
    e.preventDefault()
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      }),
    )
    setNewMessageText('')
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
      },
    ])
  }

  const onlinePeopleExcludingOurUser = { ...onlinePeople } // da pokazuje online korisnike, bez nas trenutnih
  delete onlinePeopleExcludingOurUser[id]

  const messagesWithoutDupes = uniqBy(messages, 'id')

  return (
    <div className="flex h-screen">
      <div className="bg-blue-200 w-3/4 p-2 flex flex-col">
        <div className="flex-grow">
          {!!selectedUserId && (
            <div className="overflow-scroll">
              {messagesWithoutDupes.map((message) => (
                <div key={message._id}>
                  <div
                    className={
                      'inline-block p-2 my-2 rounded-sm text-sm ' +
                      (message.sender === id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-500')
                    }
                  >
                    sender: {message.sender}
                    <br />
                    my id: {id} <br />
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-500 text-2xl">
                No selected person... &rarr;
              </div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          <form className="flex gap-2 mx-3" onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              placeholder="Type your message here..."
              className="bg-white border p-2 flex-grow rounded-sm"
            />
            <button
              type="submit"
              className="bg-blue-500 px-3 py-2 text-white rounded-sm"
            >
              <BsFillSendPlusFill
                style={{ fontSize: '32px' }}
                className="transition-all hover:text-blue-200"
              />
            </button>
          </form>
        )}
      </div>
      <div className="bg-white flex-grow">
        <Logo />
        {Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUserId(userId)}
            className={
              'border-b border-gray-100 gap-2 cursor-pointer flex items-center w-full ' +
              (userId === selectedUserId ? 'bg-blue-100' : '')
            }
          >
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 flex-grow items-center">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-gray-700">{onlinePeople[userId]}</span>
            </div>
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-l-md"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
