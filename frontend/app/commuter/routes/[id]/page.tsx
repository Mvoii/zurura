import RouteDetailsClient from "./route-details-client"

interface RouteDetailsPageProps {
  params: {
    id: string
  }
}

// Server component that passes the route ID to the client component
export default async function RouteDetailsPage({ params }: RouteDetailsPageProps) {
  // Await the params object
  const { id } = await params
  
  // Return the client component with the ID
  return <RouteDetailsClient id={id} />
} 