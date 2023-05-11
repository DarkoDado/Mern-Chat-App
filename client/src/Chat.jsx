import { useEffect, useState } from 'react'
import { BsFillSendPlusFill } from 'react-icons/bs'
import { HiChatAlt } from 'react-icons/hi'
export default function Chat() {
  const [ws, setWs] = useState(null)
  const [onlinePeople, setOnlinePeople] = useState({})
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000')
    setWs(ws)
    ws.addEventListener('message', handleMessage)
  }, [])
  function showOnlinePeople(peopleArray) {
    const people = {}
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username
    })
    setOnlinePeople(people)
  }
  function handleMessage(e) {
    const messageData = JSON.parse(e.data)
    if ('online' in messageData) {
      showOnlinePeople(messageData.online)
    }
  }
  return (
    <div className="flex h-screen">
      <div className="bg-blue-200 w-2/3 p-2 flex flex-col">
        <div className="flex-grow">Messages with selected person</div>
        <div className="flex gap-2 mx-3">
          <input
            type="text"
            placeholder="Type your message here..."
            className="bg-white border p-2 flex-grow rounded-sm"
          />
          <button className="bg-blue-500 px-3 py-2 text-white rounded-sm">
            <BsFillSendPlusFill
              style={{ fontSize: '26px' }}
              className="transition-all hover:text-blue-200"
            />
          </button>
        </div>
      </div>
      <div className="bg-white w-1/3 pl-4 pt-4">
        <div className="text-blue-500 font-bold flex gap-1 items-center mb-3">
          <HiChatAlt size={34}/>
          MernChat
        </div>
        {Object.keys(onlinePeople).map((userId) => (
          <div key={userId} className="border-b border-gray-100 py-2">
            {onlinePeople[userId]}
          </div>
        ))}
      </div>
    </div>
  )
}
