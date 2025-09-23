/**
 * Detect user's geographic location using actual geolocation only
 */
export const detectUserLocation = async (): Promise<string> => {
    try {
        // 1. Check cached location first
        const cachedState = getCachedState()
        if (cachedState) {
            console.log('State retrieved from cache:', cachedState)
            return cachedState
        }

        // 2. Use IP geolocation
        const detectedState = await detectStateFromIP()
        if (detectedState) {
            cacheState(detectedState)
            console.log('State detected from IP:', detectedState)
            return detectedState
        }

        // 3. Default fallback
        console.log('Using default state: nevada')
        return 'nevada'
        
    } catch (error) {
        console.error('Error detecting user location:', error)
        return 'nevada' // Safe default
    }
}

/**
 * Get cached state from localStorage
 */
const getCachedState = (): string | null => {
    if (typeof window === 'undefined') return null
    
    try {
        const cached = localStorage.getItem('user_geolocation')
        if (!cached) return null
        
        const { state, timestamp } = JSON.parse(cached)
        const cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours
        const isExpired = Date.now() - timestamp > cacheExpiry
        
        if (isExpired) {
            localStorage.removeItem('user_geolocation')
            return null
        }
        
        return state
    } catch (error) {
        console.error('Error reading cached state:', error)
        localStorage.removeItem('user_geolocation')
        return null
    }
}

/**
 * Cache the detected state
 */
const cacheState = (state: string): void => {
    if (typeof window === 'undefined') return
    
    try {
        const cacheData = {
            state,
            timestamp: Date.now()
        }
        localStorage.setItem('user_geolocation', JSON.stringify(cacheData))
    } catch (error) {
        console.error('Error caching state:', error)
    }
}

/**
 * Detect state using IP geolocation services
 */
const detectStateFromIP = async (): Promise<string | null> => {
    const services = [
        {
            name: 'ipapi.co',
            url: 'https://ipapi.co/json/',
            parser: (data: any) => mapRegionToState(data.region, data.region_code)
        },
        {
            name: 'ipinfo.io', 
            url: 'https://ipinfo.io/json',
            parser: (data: any) => mapRegionToState(data.region, data.region)
        }
    ]

    for (const service of services) {
        try {
            console.log(`Trying geolocation service: ${service.name}`)
            
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            
            const response = await fetch(service.url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            
            const data = await response.json()
            const state = service.parser(data)
            
            if (state) {
                return state
            }
            
        } catch (error) {
            console.warn(`Geolocation service ${service.name} failed:`, error)
            continue
        }
    }
    
    return null
}

/**
 * Map region to Nevada or California
 */
const mapRegionToState = (regionName?: string, regionCode?: string): string | null => {
    if (!regionName && !regionCode) return null
    
    const region = (regionName || regionCode || '').toLowerCase()
    
    // Nevada mappings
    if (region.includes('nevada') || region === 'nv') {
        return 'nevada'
    }
    
    // California mappings  
    if (region.includes('california') || region === 'ca') {
        return 'california'
    }
    
    return null
}
