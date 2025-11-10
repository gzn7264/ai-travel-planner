// 语音识别服务
import { speech } from './api'

export class SpeechRecognitionService {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
    this.apiKey = ''
  }
  
  // TODO: 设置API密钥
  setApiKey(key) {
    this.apiKey = key
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
  
  // TODO: 识别语音
  async recognizeSpeech(audioBlob) {
    try {
      if (!this.apiKey) {
        throw new Error('未设置语音识别API密钥')
      }
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      // 调用API进行语音识别
      const response = await speech.recognizeSpeech(formData, this.apiKey)
      
      return response.data.text
    } catch (error) {
      console.error('语音识别失败:', error)
      throw error
    }
  }
  
  // TODO: 语音转文本（完整流程）
  async speechToText() {
    try {
      // 开始录音
      await this.startRecording()
      
      // 提示用户说话（可以通过UI提示）
      console.log('请说话...')
      
      // 等待一段时间后自动停止（实际应用中应该由用户手动停止）
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // 停止录音
      const audioBlob = await this.stopRecording()
      
      // 识别语音
      const text = await this.recognizeSpeech(audioBlob)
      
      return text
    } catch (error) {
      console.error('语音转文本失败:', error)
      throw error
    }
  }
  
  // TODO: 解析语音指令
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