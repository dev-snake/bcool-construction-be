const ERROR_MAP: Record<string, string> = {
  // Class-validator common messages
  'must be a number conforming to the specified constraints': 'phải là một số hợp lệ',
  'should not be empty': 'không được để trống',
  'must be an email': 'phải là một địa chỉ email hợp lệ',
  'must be a string': 'phải là một chuỗi ký tự',
  'must be longer than or equal to': 'phải có ít nhất',
  'must be shorter than or equal to': 'phải có tối đa',
  'characters': 'ký tự',
  'must be a boolean value': 'phải là giá trị logic (đúng/sai)',
  'must be an integer number': 'phải là một số nguyên',
  'must be a number': 'phải là một số',
  'must be a valid ISO 8601 date string': 'phải là định dạng ngày ISO 8601 hợp lệ',
  'must be an array': 'phải là một danh sách',
  'must be a UUID': 'phải là định dạng UUID hợp lệ',

  // HTTP Errors
  'Unauthorized': 'Không có quyền truy cập',
  'Forbidden': 'Truy cập bị từ chối',
  'Not Found': 'Không tìm thấy tài nguyên',
  'Internal Server Error': 'Lỗi máy chủ nội bộ',
  'Bad Request': 'Yêu cầu không hợp lệ',
  'Conflict': 'Xung đột dữ liệu',
  'Payload Too Large': 'Dung lượng dữ liệu quá lớn',
  'Unsupported Media Type': 'Định dạng phương tiện không được hỗ trợ',
  'Unprocessable Entity': 'Thực thể không thể xử lý',
  'Too Many Requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
};

// Property name translations
const PROPERTY_MAP: Record<string, string> = {
  'email': 'Email',
  'password': 'Mật khẩu',
  'fullName': 'Họ và tên',
  'phone': 'Số điện thoại',
  'address': 'Địa chỉ',
  'name': 'Tên',
  'title': 'Tiêu đề',
  'content': 'Nội dung',
  'description': 'Mô tả',
  'latitude': 'Vĩ độ',
  'longitude': 'Kinh độ',
  'sortOrder': 'Thứ tự sắp xếp',
  'username': 'Tên đăng nhập',
  'currentPassword': 'Mật khẩu hiện tại',
  'newPassword': 'Mật khẩu mới',
  'categoryId': 'Danh mục',
  'slug': 'Đường dẫn (slug)',
  'thumbnailUrl': 'Ảnh đại diện',
  'isPublished': 'Trạng thái phát hành',
  'publishAt': 'Ngày phát hành',
  'allowComment': 'Cho phép bình luận',
  'workingHours': 'Giờ làm việc',
  'isMainBranch': 'Trụ sở chính',
  'isVisible': 'Trạng thái hiển thị',
  'categoryName': 'Tên danh mục',
  'code': 'Mã',
};

export function translateErrorMessage(message: string): string {
  if (!message) return message;

  let translatedMessage = message;

  // Try to find exact matches first
  if (ERROR_MAP[message]) {
    return ERROR_MAP[message];
  }

  // Handle class-validator messages that include property names
  // e.g., "latitude must be a number conforming to the specified constraints"
  for (const [english, vietnamese] of Object.entries(ERROR_MAP)) {
    if (translatedMessage.includes(english)) {
      translatedMessage = translatedMessage.replace(english, vietnamese);
    }
  }

  // Translate property names if they appear at the start of the message
  for (const [english, vietnamese] of Object.entries(PROPERTY_MAP)) {
    // Check if the message starts with the property name (case-insensitive)
    const regex = new RegExp(`^${english}\\s`, 'i');
    if (regex.test(translatedMessage)) {
      translatedMessage = translatedMessage.replace(regex, `${vietnamese} `);
    }
  }

  return translatedMessage;
}
