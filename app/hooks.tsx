import { useLocalStorage } from "@mantine/hooks"
import { useSearchParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const keys = {
  getCollections: ["collections"],
}

export function useGetVersion(url?: string) {
  return useQuery({
    enabled: !!url,
    queryKey: ["version", url],
    queryFn: async () => {
      const resp = await fetch(`${url}/api/v1/version`)
      return resp.json()
    }
  })
}

export function useGetTableVersion() {
  const [url] = useLocalStorage({ key: 'url' })
  return useQuery({
    enabled: !!url,
    queryKey: ["version", url],
    queryFn: async () => {
      const resp = await fetch(`${url}/api/v1/version`)
      return resp.json()
    }
  })
}

export function useGetCollections(options?: any) {
  const [url] = useLocalStorage({ key: 'url' })
  return useQuery({
    enabled: !!url,
    queryKey: keys.getCollections,
    queryFn: async () => {
      const resp = await fetch(`${url}/api/v1/collections`)
      return resp.json()
    }
  })
}

export function useAddCollection(options?: any) {
  const [url] = useLocalStorage({ key: 'url' })
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const resp = await fetch(`${url}/api/v1/collections`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (!resp.ok) {
        const err = await resp.json()
        return Promise.reject(err)
      }
      return resp.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.getCollections })
    }
  })
}

export function useDeleteCollection(options?: any) {
  const [url] = useLocalStorage({ key: 'url' })
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (collectionName: string) => {
      const resp = await fetch(`${url}/api/v1/collections/${collectionName}`, {
        method: 'DELETE'
      })
      return resp.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.getCollections })
    }
  })
}

export function useGetRecordsCount() {
  const [url] = useLocalStorage({ key: 'url' })
  const search = useSearchParams()
  const collectionId = search.get("collection-id")
  return useQuery({
    enabled: !!url && !!collectionId,
    queryKey: ["records", collectionId, "count"],
    queryFn: async () => {
      const resp = await fetch(`${url}/api/v1/collections/${collectionId}/count`, {
        method: 'GET',
      })
      if (!resp.ok) {
        const err = await resp.json()
        return Promise.reject(err)
      }
      return resp.json()
    }
  })
}

export function useGetRecords(options?: any) {
  const [url] = useLocalStorage({ key: 'url' })
  const search = useSearchParams()
  const collectionId = search.get("collection-id")
  const page = Number.parseInt(search.get("page") || '1') - 1
  const limit = Number.parseInt(search.get("limit") || '20')
  return useQuery({
    enabled: !!url && !!collectionId,
    queryKey: ["records", collectionId, page, limit],
    queryFn: async () => {
      const resp = await fetch(`${url}/api/v1/collections/${collectionId}/get`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          include: ["documents", "metadatas"],
          offset: page * limit,
          limit: limit
        })
      })
      if (!resp.ok) {
        const err = await resp.json()
        return Promise.reject(err)
      }

      const records = await resp.json()
      return generateRecords(records)
    }
  })
}

function generateRecords(records: any) {
  const array = []
  if (records && records) {
    for (let index = 0; index < records.ids.length; index++) {
      array.push({
        id: records.ids[index],
        document: records.documents[index],
        metadata: JSON.stringify(records.metadatas[index])
      })
    }
  }
  return array
}

export function useDeleteRecord(options?: any) {
  const [url] = useLocalStorage({ key: 'url' })
  const search = useSearchParams()
  const collectionId = search.get("collection-id")
  const page = Number.parseInt(search.get("page") || '1') - 1
  const limit = Number.parseInt(search.get("limit") || '20')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const resp = await fetch(`${url}/api/v1/collections/${collectionId}/delete`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (!resp.ok) {
        const err = await resp.json()
        return Promise.reject(err)
      }
      return resp.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", collectionId, "count"] })
      queryClient.invalidateQueries({ queryKey: ["records", collectionId, page, limit] })
    }
  })
}

export function useAddRecord(options?: any) {
  const [url] = useLocalStorage({ key: 'url' })
  const search = useSearchParams()
  const collectionId = search.get("collection-id")
  const page = Number.parseInt(search.get("page") || '1') - 1
  const limit = Number.parseInt(search.get("limit") || '20')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const resp = await fetch(`${url}/api/v1/collections/${collectionId}/add`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (!resp.ok) {
        const err = await resp.json()
        return Promise.reject(err)
      }
      return resp.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", collectionId, "count"] })
      queryClient.invalidateQueries({ queryKey: ["records", collectionId, page, limit] })
    }
  })
}

export function useUpdateRecord(options?: any) {
  const [url] = useLocalStorage({ key: 'url' })
  const search = useSearchParams()
  const collectionId = search.get("collection-id")
  const page = Number.parseInt(search.get("page") || '1') - 1
  const limit = Number.parseInt(search.get("limit") || '20')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const resp = await fetch(`${url}/api/v1/collections/${collectionId}/update`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (!resp.ok) {
        const err = await resp.json()
        return Promise.reject(err)
      }
      return resp.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", collectionId, "count"] })
      queryClient.invalidateQueries({ queryKey: ["records", collectionId, page, limit] })
    }
  })
}
