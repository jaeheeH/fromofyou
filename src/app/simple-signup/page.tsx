'use client'

import React, { useState } from 'react'

export default function SimpleSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  console.log('현재 폼 데이터:', formData)

  const handleChange = (field: string, value: string) => {
    console.log(`${field} 변경됨:`, value)
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('회원가입 제출:', formData)
    
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다')
      return
    }
    
    alert('회원가입 성공! (테스트)')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>간단 회원가입 테스트</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>이름:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="홍길동"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>이메일:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="test@example.com"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>비밀번호:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="비밀번호"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>비밀번호 확인:</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="비밀번호 확인"
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', width: '100%' }}>
          회원가입 테스트
        </button>
      </form>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <h3>실시간 값:</h3>
        <p>이름: {formData.name}</p>
        <p>이메일: {formData.email}</p>
        <p>비밀번호: {'*'.repeat(formData.password.length)}</p>
        <p>비밀번호 확인: {'*'.repeat(formData.confirmPassword.length)}</p>
        <p>비밀번호 일치: {formData.password === formData.confirmPassword ? '✅' : '❌'}</p>
      </div>
    </div>
  )
}