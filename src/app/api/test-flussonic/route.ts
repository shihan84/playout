import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, port, username, password, useHttps = true, endpoint = '/api/v1/server/status' } = body

    if (!host || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: host, username, password' },
        { status: 400 }
      )
    }

    const protocol = useHttps ? 'https' : 'http'
    const url = `${protocol}://${host}:${port}${endpoint}`
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    console.log(`Testing Flussonic connection to: ${url}`)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Flussonic-Playout-System/1.0'
        },
        timeout: 10000
      })

      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`Error response: ${errorText}`)
        return NextResponse.json({
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText,
          url
        })
      }

      const data = await response.json()
      console.log('Success response:', data)

      return NextResponse.json({
        success: true,
        data,
        url,
        timestamp: new Date().toISOString()
      })

    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Network error',
        url,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Test Flussonic API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}