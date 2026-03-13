#!/usr/bin/env python3
"""
链接检查脚本 - 检查网站所有链接的有效性
"""

import os
import re
from pathlib import Path
from urllib.parse import urlparse

def extract_links(html_content, base_path):
    """从HTML内容中提取所有链接"""
    links = []
    
    # 匹配 href 属性
    href_pattern = r'href=["\']([^"\']+)["\']'
    for match in re.finditer(href_pattern, html_content):
        href = match.group(1)
        links.append({
            'type': 'href',
            'url': href,
            'line': html_content[:match.start()].count('\n') + 1
        })
    
    # 匹配 src 属性
    src_pattern = r'src=["\']([^"\']+)["\']'
    for match in re.finditer(src_pattern, html_content):
        src = match.group(1)
        links.append({
            'type': 'src',
            'url': src,
            'line': html_content[:match.start()].count('\n') + 1
        })
    
    return links

def check_link_validity(link_url, base_path, html_file):
    """检查链接是否有效"""
    # 忽略外部链接和特殊链接
    if link_url.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'javascript:')):
        return {'valid': True, 'type': 'external', 'message': '外部链接'}
    
    # 解析链接路径
    if link_url.startswith('./'):
        link_url = link_url[2:]
    
    # 获取HTML文件所在目录
    html_dir = os.path.dirname(html_file)
    
    # 构建完整路径
    if link_url.startswith('/'):
        full_path = os.path.join(base_path, link_url.lstrip('/'))
    else:
        full_path = os.path.join(html_dir, link_url)
    
    full_path = os.path.normpath(full_path)
    
    # 检查文件是否存在
    if os.path.exists(full_path):
        return {'valid': True, 'type': 'internal', 'path': full_path}
    else:
        return {'valid': False, 'type': 'internal', 'path': full_path, 'message': '文件不存在'}

def main():
    base_path = '/Users/charlie/git/AIpmtoolproject/sdzbjtwebpage/jingtuo-website'
    
    # 获取所有HTML文件
    html_files = []
    for root, dirs, files in os.walk(base_path):
        # 跳过 node_modules 等目录
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    print(f"找到 {len(html_files)} 个HTML文件")
    print("=" * 80)
    
    all_issues = []
    
    for html_file in sorted(html_files):
        rel_path = os.path.relpath(html_file, base_path)
        print(f"\n检查文件: {rel_path}")
        
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"  错误: 无法读取文件 - {e}")
            continue
        
        links = extract_links(content, base_path)
        file_issues = []
        
        for link in links:
            result = check_link_validity(link['url'], base_path, html_file)
            if not result['valid']:
                file_issues.append({
                    'line': link['line'],
                    'url': link['url'],
                    'type': link['type'],
                    'message': result.get('message', '未知错误')
                })
        
        if file_issues:
            print(f"  发现问题 ({len(file_issues)} 个):")
            for issue in file_issues:
                print(f"    第 {issue['line']} 行: {issue['type']}={issue['url']} - {issue['message']}")
            all_issues.extend([(rel_path, issue) for issue in file_issues])
        else:
            print("  ✓ 所有链接正常")
    
    print("\n" + "=" * 80)
    print(f"检查完成！共发现 {len(all_issues)} 个问题")
    
    if all_issues:
        print("\n问题汇总:")
        for file_path, issue in all_issues:
            print(f"  {file_path}:{issue['line']} - {issue['url']}")

if __name__ == '__main__':
    main()
