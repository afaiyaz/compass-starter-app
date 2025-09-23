'use client'
import { useEffect, useState } from 'react'
import { isNull } from 'lodash'
import { Page } from '@/types'
import { Hero } from '@/types/components'
import { PageWrapper, RenderComponents, NotFoundComponent, Hero as HeroComponent, Text } from '@/components'
import { onEntryChange } from '@/config'
import { getPersonalizeAttribute, isDataInLiveEdit, detectUserLocation } from '@/utils'
import useRouterHook from '@/hooks/useRouterHook'
import { setDataForChromeExtension } from '@/utils'
import { usePersonalization } from '@/context'
import { 
    textAndImageReferenceIncludes, 
    teaserReferenceIncludes, 
    textJSONRtePaths,
    heroReferenceIncludes 
} from '@/services/helper'
import { getEntryByUrl } from '@/services'

/**
 * @component EfficiencyPage - Efficiency Page Component
 * 
 * @route '/{locale}/efficiency'
 * @description Component that renders the efficiency page with personalized content for Nevada and California users
 * 
 * @returns {JSX.Element}
 */

export default function EfficiencyPage() {
    const { personalizationSDK, personalizeConfig } = usePersonalization()
    const [data, setData] = useState<Page.EfficiencyPage['entry'] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [userState, setUserState] = useState<string>('')
    const { path, locale } = useRouterHook()

    /**
     * useEffect that sets the required attributes for personalization based on user location
     */
    useEffect(() => {
        const setAttribute = async () => {
            const detectedState = await detectUserLocation()
            setUserState(detectedState)

            const audiences = personalizeConfig?.audiences
            const attributes = getPersonalizeAttribute(audiences, detectedState)
            await personalizationSDK?.set({ ...attributes })
        }

        if (personalizeConfig && personalizationSDK && data) {
            setAttribute()
        }
    }, [personalizeConfig, personalizationSDK, data])

    /**
     * @method fetchData
     * @description method to fetch the efficiency page data
     * 
     * @async
     */
    const fetchData = async () => {
        try {
            const refUids = [
                ...textAndImageReferenceIncludes,
                ...teaserReferenceIncludes,
                ...heroReferenceIncludes
            ]
            const jsonRtePaths = [
                ...textJSONRtePaths,
                'content'
            ]
            
            const entryData = await getEntryByUrl(
                'efficiency_page', 
                locale, 
                path, 
                refUids, 
                jsonRtePaths, 
                personalizationSDK
            ) as Page.EfficiencyPage['entry']
            
            setData(entryData)
            setDataForChromeExtension({ 
                entryUid: entryData?.uid || '', 
                contenttype: 'efficiency_page', 
                locale: locale 
            })
            
            if (!entryData && !isNull(entryData)) {
                throw '404'
            }
        } catch (err) {
            console.error('🚀 ~ efficiency.tsx ~ fetchData ~ err:', err)
            setLoading(false)
        }
    }

    /**
     * useEffect that handles data fetching on pageLoad and live preview
     */
    useEffect(() => {
        onEntryChange(fetchData)
    }, [path, personalizationSDK])

    const getPersonalizedContent = () => {
        const baseContent = data?.content || ''
        const stateSpecificContent = userState === 'nevada' 
            ? '\n\nExperience Nevada\'s renewable energy leadership with our state-of-the-art solar solutions designed for desert climates.'
            : '\n\nJoin California\'s green revolution with cutting-edge efficiency technologies that meet the highest environmental standards.'
        
        return `${baseContent}${stateSpecificContent}`
    }

    if (!data && !loading && !isDataInLiveEdit()) {
        return <NotFoundComponent />
    }

    return (
        data ? (
            <PageWrapper {...data}>
                {/* Hero Section with personalization */}
                {data?.hero?.length === 1 && data.hero.map((hero: Hero, index: number) => (
                    <HeroComponent
                        key={index}
                        {...hero}
                        locale={locale}
                        $={hero.$}
                    />
                ))}

                {/* Main Content Section */}
                <div className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Content Column */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                    Smart Energy for Smart States
                                </h2>
                                
                                {/* Main content with personalized additions */}
                                <Text
                                    content={getPersonalizedContent()}
                                    $={data?.$}
                                    className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed"
                                />
                                
                                {/* State-specific features */}
                                <div className="space-y-4">
                                    {userState === 'nevada' ? (
                                        <>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Desert-optimized solar panels
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Extreme heat resistance technology
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Mining industry energy solutions
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Coastal climate solar solutions
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Tech industry energy optimization
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    CARB-compliant solutions
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Personalization indicator */}
                            <div className="relative">
                                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Personalized for:
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            userState === 'nevada' 
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                            {userState === 'nevada' ? 'Nevada' : 'California'} users
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="py-16 bg-white dark:bg-gray-800">
                    <div className="max-w-4xl mx-auto px-6">
                        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
                            {userState === 'nevada' ? 'Nevada Energy Impact' : 'California Energy Leadership'}
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-6">
                                <div className={`text-4xl font-bold mb-2 ${userState === 'nevada' ? 'text-blue-600' : 'text-green-600'}`}>
                                    {userState === 'nevada' ? '75%' : '85%'}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">Energy Efficiency Improvement</p>
                            </div>
                            <div className="p-6">
                                <div className={`text-4xl font-bold mb-2 ${userState === 'nevada' ? 'text-blue-600' : 'text-green-600'}`}>
                                    {userState === 'nevada' ? '300+' : '500+'}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">Installations Completed</p>
                            </div>
                            <div className="p-6">
                                <div className={`text-4xl font-bold mb-2 ${userState === 'nevada' ? 'text-blue-600' : 'text-green-600'}`}>
                                    {userState === 'nevada' ? '$2.5M' : '$4.2M'}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">Annual Savings Generated</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Render additional components from CMS */}
                {data?.components && data.components.length > 0 && (
                    <RenderComponents 
                        $={data?.$}
                        components={data.components}
                    />
                )}

                {/* CTA Section */}
                <div className={`py-16 ${userState === 'nevada' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h3 className="text-3xl font-bold mb-4">
                            Ready to Transform Your Energy Future?
                        </h3>
                        <p className="text-xl opacity-90 mb-8">
                            Join thousands of {userState === 'nevada' ? 'Nevada' : 'California'} businesses 
                            saving money and reducing their carbon footprint.
                        </p>
                        <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300">
                            Get Started Today
                        </button>
                    </div>
                </div>
            </PageWrapper>
        ) : (
            !loading && !isDataInLiveEdit() && <NotFoundComponent />
        )
    )
}
