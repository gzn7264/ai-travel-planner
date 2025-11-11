// 语音识别服务 - 基于科大讯飞API
import { speech } from './api'

export class SpeechRecognitionService {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
    this.apiKey = ''
    this.appId = ''
    this.apiSecret = ''
    this.recordingDuration = 5000 // 默认录音时长
    this.audioSettings = {
      sampleRate: 16000, // 采样率
      channels: 1, // 声道
      encoding: 'wav' // 编码格式
    }
  }
  
  // 设置科大讯飞API凭证
  setCredentials(config) {
    if (config.apiKey) this.apiKey = config.apiKey
    if (config.appId) this.appId = config.appId
    if (config.apiSecret) this.apiSecret = config.apiSecret
  }
  
  // 设置录音参数
  setRecordingOptions(options) {
    if (options.duration) this.recordingDuration = options.duration
    if (options.audioSettings) {
      this.audioSettings = { ...this.audioSettings, ...options.audioSettings }
    }
  }
  
  // TODO: 开始录音
  async startRecording() {
    try {
      // 检查浏览器支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('浏览器不支持录音功能')
      }
      
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // 创建MediaRecorder实例
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []
      
      // 收集音频数据
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      // 开始录音
      this.mediaRecorder.start()
      this.isRecording = true
      
      console.log('录音已开始')
      return true
    } catch (error) {
      console.error('开始录音失败:', error)
      throw error
    }
  }
  
  // TODO: 停止录音
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('未在录音中'))
        return
      }
      
      this.mediaRecorder.onstop = async () => {
        try {
          // 创建音频Blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
          
          // 停止所有音轨
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
          
          this.isRecording = false
          console.log('录音已停止')
          
          resolve(audioBlob)
        } catch (error) {
          reject(error)
        }
      }
      
      // 停止录音
      this.mediaRecorder.stop()
    })
  }
  
  // 识别语音 - 使用科大讯飞API
  async recognizeSpeech(audioBlob) {
    try {
      // 检查API配置
      if (!this.apiKey && !this.apiSecret) {
        console.warn('未设置科大讯飞API凭证，将使用备选方案');
        // 创建FormData对象
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')
        
        // 调用备选方案
        const response = await speech.fallbackSpeechRecognition(formData)
        return response.data.text
      }
      
      console.log('开始语音识别...');
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', 'zh_cn') // 设置识别语言
      formData.append('accent', 'mandarin') // 设置口音
      
      // 调用科大讯飞API进行语音识别
      const response = await speech.recognizeSpeech(formData, this.apiKey)
      
      // 检查响应格式
      if (!response || !response.data || !response.data.text) {
        throw new Error('科大讯飞API返回格式错误')
      }
      
      console.log('语音识别成功:', response.data.text);
      return response.data.text
    } catch (error) {
      console.error('语音识别失败:', error)
      // 抛出用户友好的错误
      throw new Error(`语音识别失败: ${error.message || '未知错误'}`)
    }
  }
  
  // 语音转文本（完整流程）
  async speechToText() {
    try {
      // 开始录音
      await this.startRecording()
      
      // 提示用户说话
      console.log('请说话...')
      
      // 根据配置的录音时长等待（实际应用中应提供手动停止功能）
      await new Promise(resolve => setTimeout(resolve, this.recordingDuration))
      
      // 停止录音
      const audioBlob = await this.stopRecording()
      
      // 识别语音
      const text = await this.recognizeSpeech(audioBlob)
      
      // 解析识别结果
      const parsedCommand = this.parseSpeechCommand(text)
      
      return {
        originalText: text,
        parsedCommand
      }
    } catch (error) {
      console.error('语音转文本失败:', error)
      throw error
    }
  }
  
  // 手动停止录音并返回结果
  async stopAndRecognize() {
    try {
      if (!this.isRecording) {
        throw new Error('未在录音中')
      }
      
      // 停止录音
      const audioBlob = await this.stopRecording()
      
      // 识别语音
      const text = await this.recognizeSpeech(audioBlob)
      
      // 解析识别结果
      const parsedCommand = this.parseSpeechCommand(text)
      
      return {
        originalText: text,
        parsedCommand
      }
    } catch (error) {
      console.error('停止录音并识别失败:', error)
      throw error
    }
  }
  
  // 解析语音指令 - 增强版支持更多旅行相关指令
  parseSpeechCommand(text) {
    // 简单的指令解析逻辑
    // 实际应用中可以使用更复杂的NLP技术
    const commandPatterns = {
      destination: /去(.*?)[,，]/,
      days: /(\d+)天/,
      budget: /预算(\d+[万千百]*)/,
      preferences: /喜欢([^，,]+)/,
      travelers: /(带孩子|\d+人)/
    }
    
    const result = {}
    
    // 提取目的地
    const destinationMatch = text.match(commandPatterns.destination)
    if (destinationMatch) {
      result.destination = destinationMatch[1]
    }
    
    // 提取天数
    const daysMatch = text.match(commandPatterns.days)
    if (daysMatch) {
      result.days = parseInt(daysMatch[1])
    }
    
    // 提取预算
    const budgetMatch = text.match(commandPatterns.budget)
    if (budgetMatch) {
      let budget = budgetMatch[1]
      // 处理中文数字单位
      if (budget.includes('万')) {
        budget = parseFloat(budget) * 10000
      }
      result.budget = budget
    }
    
    // 提取偏好
    const preferencesMatch = text.match(commandPatterns.preferences)
    if (preferencesMatch) {
      result.preferences = preferencesMatch[1].split('和')
    }
    
    // 提取出行人数
    const travelersMatch = text.match(commandPatterns.travelers)
    if (travelersMatch) {
      if (travelersMatch[1].includes('带孩子')) {
        result.hasChildren = true
      } else {
        result.travelers = parseInt(travelersMatch[1])
      }
    }
    
    return result
  }
}

// 导出单例实例
export const speechRecognitionService = new SpeechRecognitionService()