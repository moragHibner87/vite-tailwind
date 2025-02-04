import { useEffect, useRef } from "react"
import { useImmerReducer } from "use-immer";

function onlyUniqeBreeds(pics_arr){
  const uniqeBreeds = []
  const uniqePics = pics_arr.filter(pic => {
    const breed = pic.split('/')[4];
    if(!uniqeBreeds.includes(breed) && !pic.includes(' ')){
      uniqeBreeds.push(breed)
      return true
    }
  })
  return uniqePics.slice(0, Math.floor(uniqePics.length / 4) * 4)
}

const initState = {
  points: 0,
  strikes: 0,
  timeRemaining: 0,
  highScore: 0,
  bigCollection: [],
  currentQestion: null,
  playing: false,
  fechCount:0
}
function ourReducer(draft, action){
  if(draft.points > draft.highScore) draft.highScore = draft.points
  switch (action.type){
    case "startPlaying":
      draft.timeRemaining = 30
      draft.points = 0
      draft.strikes = 0
      draft.playing = true
      draft.currentQestion = generateQuestion()
      return
    case "addToCollection":
      draft.bigCollection = draft.bigCollection.concat(action.value)
      return
    case "guessAttempt":
      if (!draft.playing) return
      if(action.value === draft.currentQestion.answer) {
        draft.points++
        draft.currentQestion = generateQuestion()
      } else {
        draft.strikes++
        if (draft.strikes >= 3){
          draft.playing = false
        }
      }
      return
    case "decreaseTime":
      if(draft.timeRemaining <= 0){
        draft.playing = false
      } else{
        draft.timeRemaining--
      }
      return
    case "receiveHightScore":
      draft.highScore = action.value
      if(!action.value) draft.highScore = 0
      return
  }

  function generateQuestion(){
    if (draft.bigCollection.length <= 12) {
      draft.fechCount++
    }
    if (draft.currentQestion) {
      draft.bigCollection = draft.bigCollection.slice(4, draft.bigCollection.length)
    }
    const tempRnd = Math.floor(Math.random() * 4)
    const just4 = draft.bigCollection.slice(0, 4)
    return {
      breed: just4[tempRnd].split("/")[4],
      photos: just4,
      answer: tempRnd
    }
  }

}

function HeartIcon(props){
  return (
    <svg className={props.className} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
      <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"/>
    </svg>
  )
}

//APP
function App() {
  const timer = useRef(null)
  const [state, dispatch] = useImmerReducer(ourReducer, initState)

  useEffect(() => {
    dispatch({type: "receiveHightScore", value: localStorage.getItem("highscore")})
  }, [])

  useEffect(() => {
    if(state.highScore > 0){
      localStorage.setItem("highscore", state.highScore)
    }
  }, [state.highScore])

  useEffect(() => {
    if(state.bigCollection.length){
      state.bigCollection.slice(0, 8).forEach(pic => {
        new Image().src = pic
      })
    }
  }, [state.bigCollection])

  useEffect(() => {
    if(state.playing){
      timer.current = setInterval(() => {
        dispatch({type: "decreaseTime"})
      },1000)

      return () => {
        clearInterval(timer.current)
      }
    }
  },[state.playing])

  useEffect(() => {
    const reqController = new AbortController()
    async function go() {
     try{
      const picPromise = await fetch('https://dog.ceo/api/breeds/image/random/50', {signal: reqController.signal})
      const pics = await picPromise.json()
      const uniqePics = onlyUniqeBreeds(pics.message)
      dispatch(
        {type: "addToCollection", value: uniqePics}
      )
     }
     catch{
      console.log('Our request was canceled')
     }
    }
    go()

    return () => {
      reqController.abort()
    }

  }, [state.fechCount])

  return (
    <div className="pt-8 min-h-[100svh] bg-green-100">
      {state.currentQestion && (
        <>
        <p className="text-center">
          <span className="text-zinc-400 mr-3">
            <svg className={"inline-block " + (state.playing ? "animate-spin" : "")} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
              <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
              <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
            </svg>
            <span className="font-mono text-4xl relative top-2 ml-3">
              0:{state.timeRemaining < 10 ? "0" + state.timeRemaining : state.timeRemaining}
            </span>
          </span>
          {[...Array(3 - state.strikes)].map((heart, i) => {
            return <HeartIcon key={i} className="inline text-pink-600 mx-1" />
          })}
          {[...Array(state.strikes)].map((heart, i) => {
            return <HeartIcon key={i} className="inline text-pink-100 mx-1" />
          })}
        </p>
        <h1 className="text-center font-bold pt-3 pb-10 text-4xl md:text-7xl capitalize">
          {state.currentQestion.breed}
        </h1>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 px-5 mx-auto max-w-[1200px]">
            {state.currentQestion.photos.map((photo, i) => {
              return <div onClick={() => dispatch({type: "guessAttempt", value: i})} className="rounded-lg aspect-[1/1.2] bg-cover bg-center cursor-pointer shadow-xl" style={{backgroundImage:`url(${photo})`}} key={i}></div>
            })}
          </div>
        </>
      )}
     {state.playing == false && Boolean(state.bigCollection.length) && !state.currentQestion && (
       <p className="text-center flex justify-center items-center fixed inset-0">
        <div>
          <h2 className="text-3xl lg:text-6xl font-bold mb-8">Welcome to <br/> Dog Guessing Game</h2>
          <button onClick={() => dispatch({type: 'startPlaying'})} className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-8 py-3 rounded text-2xl font-bold">
            Play
          </button>
        </div>
        </p>
     )}

     {(state.timeRemaining <= 0 || state.strikes >= 3) && state.currentQestion && (
      <div className="fixed inset-0 bg-black/80 text-white flex items-center justify-center text-center">
        <div>
          {state.timeRemaining <= 0 && <p className="text-6xl mb-4 font-bold">You'er Out of Time!</p>}
          {state.strikes >= 3 && <p className="text-6xl mb-4 font-bold">3 Strikes, You're Out!</p>}
          <p>Your score:{" "}
            <span className="text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="inline-block relative bottom-1 mx-1" viewBox="0 0 16 16">
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
            </svg>
            {state.points}
            </span>
          </p>
          <p className="mb-5">Your all-time high score: {state.highScore}</p>
          <button onClick={() => dispatch({type: 'startPlaying'})} className="text-white bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-3 rounded text-lg font-bold">
            Play again
          </button>
        </div>
      </div>
     )}
    </div>
  )
}

export default App
