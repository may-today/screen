import { createSignal, createResource } from 'solid-js'

const fetchData = async() => (await fetch('https://mayday.blue/api/all')).json();

export default () => {
  const [data] = createResource(fetchData)

  return (
    <div class="p-6">
      <span>{data.loading && 'Loading...'}</span>
      <div>
        <pre>{JSON.stringify(data(), null, 2)}</pre>
      </div>
    </div>
  )
}