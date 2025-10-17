import { getPayload } from 'payload'

import config from '@/payload.config'

export async function GET(request: Request) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Get the query parameters
  const url = new URL(request.url)
  const countParam = url.searchParams.get('count')
  const disableTransactionParam = url.searchParams.get('disable-transaction')
  const rowCount = countParam ? parseInt(countParam, 10) : 10
  const disableTransaction = disableTransactionParam === 'true'

  if (isNaN(rowCount) || rowCount < 1) {
    return new Response(
      JSON.stringify({
        error: 'Invalid count parameter. Must be a positive number.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // Generate a random value for bar
  const barValue = `test-${Math.random().toString(36).substring(2, 15)}`

  try {
    // Step 1: Create rows of foo in a loop based on count parameter
    const createdIds: string[] = []
    for (let i = 0; i < rowCount; i++) {
      const result = await payload.create({
        collection: 'foo',
        data: {
          bar: barValue,
        },
        depth: 0,
      })
      createdIds.push(String(result.id))
    }

    // Step 2: Update all rows where bar equals the created bar value
    const updateResult = await payload.update({
      collection: 'foo',
      where: {
        bar: {
          equals: barValue,
        },
      },
      data: {
        bar: `${barValue}-updated`,
      },
      ...(disableTransaction && { disableTransaction: true }),
    })

    // Step 3: Count the updated rows
    const countResult = await payload.find({
      collection: 'foo',
      where: {
        bar: {
          equals: `${barValue}-updated`,
        },
      },
    })

    // Return comprehensive results
    return new Response(
      JSON.stringify({
        barUsed: barValue,
        rowsCreated: rowCount,
        rowsUpdated: updateResult.docs.length,
        finalCount: countResult.docs.length,
        disableTransaction,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: unknown) {
    console.error('Combined operation error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to complete combined operation',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
