/* eslint-disable no-unused-vars*/
import { useRouter } from 'next/router'
import { ChartData, ChartDataBins, getReadableValue, PROTOCOL_NAMES_MAP } from '~/utils/liquidations'
import logoLight from '~/public/defillama-press-kit/defi/PNG/defillama-light-neutral.png'
import logoDark from '~/public/defillama-press-kit/defi/PNG/defillama-dark-neutral.png'
import { ECBasicOption } from 'echarts/types/dist/shared'

export const convertChartDataBinsToArray = (obj: ChartDataBins, totalBins: number) => {
	// // this line below suddenly throws error in browser that the iterator cant iterate??
	// const arr = [...Array(totalBins).keys()].map((i) => obj.bins[i] || 0)
	const arr = Array.from({ length: totalBins }, (_, i) => i).map((i) => obj.bins[i] || 0)
	return arr
}

export const getOption = (chartData: ChartData, stackBy: 'chains' | 'protocols', isSmall: boolean, isDark: boolean) => {
	const chartDataBins = chartData.chartDataBins[stackBy]
	// convert chartDataBins to array
	const chartDataBinsArray = Object.keys(chartDataBins).map((key) => ({
		key: key,
		data: convertChartDataBinsToArray(chartDataBins[key], 150)
	}))
	const series = chartDataBinsArray.map((obj) => ({
		type: 'bar',
		name: PROTOCOL_NAMES_MAP[obj.key],
		data: obj.data,
		tooltip: {
			valueFormatter: (value: string) => `$${getReadableValue(Number(value))}`
		},
		emphasis: {
			focus: 'series'
		},
		stack: 'x'
	}))

	const option: ECBasicOption = {
		graphic: {
			type: 'image',
			z: 0,
			style: {
				image: isDark ? logoLight.src : logoDark.src,
				height: 40,
				opacity: 0.3
			},
			left: isSmall ? '40%' : '45%',
			top: '130px'
		},
		legend: {
			orient: 'vertical',
			align: 'left',
			left: 10,
			textStyle: {
				color: '#a1a1aa'
			},
			inactiveColor: '#a1a1aa90'
		},
		grid: {
			left: '2%',
			right: '1%',
			top: '2%',
			bottom: '2%',
			containLabel: true
		},
		dataZoom: [
			{
				type: 'inside',
				start: 0,
				end: 100
			}
		],
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross'
			},
			formatter: (params: any) => {
				const { name } = params[0]
				return (
					`<div style="margin-bottom: 8px"><b>Liquidations at ~$${name}</b></div>` +
					// `<br/>` +
					params
						.map(
							(param: any) =>
								`<span style="color: ${param.color}; margin-bottom: 2px">  <b>${
									param.seriesName
								} :</b> $${getReadableValue(Number(param.value))}</span>`
						)
						.join('<br/>')
				)
			}
		},
		xAxis: {
			// bins
			type: 'category',
			splitLine: {
				lineStyle: {
					color: '#a1a1aa',
					opacity: 0.1
				}
			},
			axisLabel: {
				formatter: (value: string) => `$${Number(value).toFixed(3)}`
			},
			axisTick: {
				alignWithLabel: true
			},
			data: Array.from({ length: chartData.totalBins }, (_, i) => i).map((x) => (x * chartData.binSize).toFixed(3))
		},
		yAxis: {
			type: 'value',
			position: 'right',
			axisLabel: {
				formatter: (value: string) => `$${getReadableValue(Number(value))}`
			},
			splitLine: {
				lineStyle: {
					color: '#a1a1aa',
					opacity: 0.1
				}
			}
		},
		series
	}

	return option
}

export const useStackBy = () => {
	const router = useRouter()
	const { stackBy } = router.query as { stackBy: 'chains' | 'protocols' }
	const _stackBy = !!stackBy ? stackBy : 'protocols'
	return _stackBy
}
