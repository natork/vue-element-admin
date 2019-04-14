import request from '@/utils/request'

export function getUsers() {
  return request({
    url: '/test/users',
    method: 'get'
  })
}

