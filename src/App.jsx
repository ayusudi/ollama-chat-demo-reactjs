import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import Markdown from 'react-markdown'

function App() {
  const [chats, setChats] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('chats') && localStorage.getItem('chats').length) {
      let jsonfy = JSON.parse(localStorage.getItem('chats'))
      setChats(jsonfy)
    }
  }, [])

  const askLllm = (e) => {
    let temp = [...chats]
    temp.push({ content: input, role: "user", date: new Date().toISOString() })
    let messages = temp.map(({ role, content }) => {
      return {
        role, content
      }
    })
    e.preventDefault()
    const data = {
      model: "llama3",
      messages,
      stream: false
    };
    setIsLoading(true)
    setChats(temp)
    setInput('')
    axios.post(`/api/chat`, data)
      .then(response => {
        console.log(response.data);
        console.log(response.data.response);
        temp.push({ content: response.data.message.content, role: "assistant", date: new Date().toISOString() })
        setChats(temp)
        setIsLoading(false)
        let jsonfy = JSON.stringify(temp)
        localStorage.setItem("chats", jsonfy)
      })
      .catch(error => {
        console.error('Error:', error);
      });

  }

  return (
    <section className='m-auto px-6 md:px-14 h-[100vh]'>
      <div className='sticky h-10 w-full bg-[#2E2E2E]'></div>
      <div className='scroll-container h-[calc(100vh-240px)] overflow-y-auto overflow-y-auto'>
        {
          chats.map((el, i) => {
            return (
              <div key={i} className='text-white'>
                <p className='text-[#9BCD31]'>{new Date(el.date).toLocaleTimeString('en',
                  { timeStyle: 'short', hour12: false })} - {el.role}</p>
                <Markdown>{el.content}</Markdown>
              </div>
            )
          })
        }
        {
          isLoading && (
            <div className='flex flex-col'>
              <p className='text-[#9BCD31]'>{new Date(chats[chats.length - 1].date).toLocaleTimeString('en',
                { timeStyle: 'short', hour12: false })} - assistant</p>
              <span className='flex text-white p-0 gap-1.5'>
                Loading
                <img src="https://miro.medium.com/v2/resize:fit:1260/1*ngNzwrRBDElDnf2CLF_Rbg.gif" alt='loading' className='p-0 object-contain' height="18" width="18" />
              </span>
            </div>
          )
        }
      </div>
      <form className='m-auto w-full flex justify-center items-between gap-4 py-10 box-border' onSubmit={askLllm}>
        <textarea className='flex-1 py-2 px-3' name="postContent" value={input} onChange={(e) => setInput(e.target.value)} rows={4} cols={50} />
        <div className='flex flex-col items-between justify-between'>
          <input className='bg-[#9BCD31] font-bold rounded p-3 cursor-pointer' type="submit" value="Send" />
          <button type='reset' className='bg-[#990100] text-white font-bold rounded p-3 cursor-pointer' onClick={() => setChats([]) && localStorage.clear()}>Clear</button>
        </div>
      </form>
    </section>
  )
}

export default App
