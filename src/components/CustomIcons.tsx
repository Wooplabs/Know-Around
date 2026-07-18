import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
  style?: any;
}

export const ACIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M7 12H17M16 3C18.339 3 19.508 3 20.362 3.536C20.8075 3.81584 21.1842 4.19251 21.464 4.638C22 5.492 22 6.66 22 9C22 11.34 22 12.508 21.463 13.362C21.1836 13.8069 20.8077 14.1832 20.363 14.463C19.507 15 18.338 15 16 15H8C5.661 15 4.492 15 3.638 14.463C3.19273 14.1837 2.81608 13.8078 2.536 13.363C2 12.507 2 11.338 2 9C2 6.662 2 5.492 2.536 4.638C2.81584 4.19251 3.19251 3.81584 3.638 3.536C4.492 3 5.66 3 8 3H16Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 21C6.53043 21 7.03914 20.7893 7.41421 20.4142C7.78929 20.0391 8 19.5304 8 19V18M18 21C17.4696 21 16.9609 20.7893 16.5858 20.4142C16.2107 20.0391 16 19.5304 16 19V18M12 18V21M18.125 7H18M18.25 7C18.25 7.0663 18.2237 7.12989 18.1768 7.17678C18.1299 7.22366 18.0663 7.25 18 7.25C17.9337 7.25 17.8701 7.22366 17.8232 7.17678C17.7763 7.12989 17.75 7.0663 17.75 7C17.75 6.9337 17.7763 6.87011 17.8232 6.82322C17.8701 6.77634 17.9337 6.75 18 6.75C18.0663 6.75 18.1299 6.77634 18.1768 6.82322C18.2237 6.87011 18.25 6.9337 18.25 7Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const BellIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M18.75 9.71V9.005C18.75 5.136 15.726 2 12 2C8.274 2 5.25 5.136 5.25 9.005V9.71C5.2512 10.5516 5.01105 11.3758 4.558 12.085L3.45 13.81C2.439 15.385 3.211 17.526 4.97 18.024C9.56629 19.3257 14.4337 19.3257 19.03 18.024C20.789 17.526 21.561 15.385 20.55 13.811L19.442 12.086C18.9886 11.3769 18.7481 10.5527 18.749 9.711L18.75 9.71Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.5 19C8.155 20.748 9.922 22 12 22C14.078 22 15.845 20.748 16.5 19"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const BookmarkIcon: React.FC<IconProps & { filled?: boolean }> = ({ color, size = 24, style, filled }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M20 15.3852V10.6429C20 6.56749 20 4.53169 18.8284 3.26537C17.6569 2 15.7707 2 12 2C8.22933 2 6.34311 2 5.17156 3.26537C4 4.53074 4 6.56939 4 10.6429V15.3861C4 18.3273 4 19.7988 4.65244 20.441C4.96356 20.7478 5.35644 20.9407 5.77511 20.992C6.65244 21.0993 7.67733 20.1303 9.72622 18.1933C10.6329 17.3374 11.0853 16.909 11.6089 16.7969C11.8667 16.7399 12.1333 16.7399 12.3911 16.7969C12.9156 16.909 13.368 17.3374 14.2738 18.1933C16.3227 20.1303 17.3476 21.0993 18.2249 20.991C18.6427 20.9407 19.0364 20.7478 19.3476 20.441C20 19.7988 20 18.3273 20 15.3852Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? strokeColor : "none"}
      />
      <Path
        d="M15 6H9"
        stroke={filled ? "none" : strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const CalendarIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M2.00005 12C2.00005 8.229 2.00005 6.343 3.17205 5.172C4.34405 4.001 6.22905 4 10 4H14C17.771 4 19.657 4 20.828 5.172C21.999 6.344 22 8.229 22 12V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.22905 22 4.34305 22 3.17205 20.828C2.00105 19.656 2.00005 17.771 2.00005 14V12Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.00007 4V2.5M17.0001 4V2.5M2.50007 9H21.5001"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 17C18 17.2652 17.8947 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18C16.7348 18 16.4805 17.8946 16.2929 17.7071C16.1054 17.5196 16 17.2652 16 17C16 16.7348 16.1054 16.4804 16.2929 16.2929C16.4805 16.1054 16.7348 16 17 16C17.2652 16 17.5196 16.1054 17.7071 16.2929C17.8947 16.4804 18 16.7348 18 17ZM18 13C18 13.2652 17.8947 13.5196 17.7071 13.7071C17.5196 13.8946 17.2652 14 17 14C16.7348 14 16.4805 13.8946 16.2929 13.7071C16.1054 13.5196 16 13.2652 16 13C16 12.7348 16.1054 12.4804 16.2929 12.2929C16.4805 12.1054 16.7348 12 17 12C17.2652 12 17.5196 12.1054 17.7071 12.2929C17.8947 12.4804 18 12.7348 18 13ZM13 17C13 17.2652 12.8947 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4805 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4805 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8947 16.4804 13 16.7348 13 17ZM13 13C13 13.2652 12.8947 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4805 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4805 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8947 12.4804 13 12.7348 13 13ZM8.00002 17C8.00002 17.2652 7.89467 17.5196 7.70713 17.7071C7.51959 17.8946 7.26524 18 7.00002 18C6.73481 18 6.48045 17.8946 6.29292 17.7071C6.10538 17.5196 6.00002 17.2652 6.00002 17C6.00002 16.7348 6.10538 16.4804 6.29292 16.2929C6.48045 16.1054 6.73481 16 7.00002 16C7.26524 16 7.51959 16.1054 7.70713 16.2929C7.89467 16.4804 8.00002 16.7348 8.00002 17ZM8.00002 13C8.00002 13.2652 7.89467 13.5196 7.70713 13.7071C7.51959 13.8946 7.26524 14 7.00002 14C6.73481 14 6.48045 13.8946 6.29292 13.7071C6.10538 13.5196 6.00002 13.2652 6.00002 13C6.00002 12.7348 6.10538 12.4804 6.29292 12.2929C6.48045 12.1054 6.73481 12 7.00002 12C7.26524 12 7.51959 12.1054 7.70713 12.2929C7.89467 12.4804 8.00002 12.7348 8.00002 13Z"
        fill={strokeColor}
      />
    </Svg>
  );
};

export const ChatIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M7.97 9.88601H16.03M7.97 14.114H13.718M12 21.25C14.0094 21.2496 15.964 20.5948 17.5682 19.3848C19.1724 18.1748 20.339 16.4753 20.8915 14.5434C21.444 12.6115 21.3524 10.5521 20.6305 8.6769C19.9086 6.80167 18.5957 5.21249 16.8904 4.14971C15.1851 3.08694 13.18 2.60837 11.1786 2.78638C9.17707 2.96439 7.28798 3.7893 5.79698 5.13636C4.30598 6.48341 3.29417 8.27934 2.91457 10.2525C2.53497 12.2258 2.80822 14.2689 3.693 16.073C3.801 16.293 3.837 16.541 3.782 16.779L2.966 20.315C2.943 20.4142 2.94564 20.5177 2.97367 20.6156C3.0017 20.7136 3.05421 20.8027 3.12624 20.8748C3.19827 20.9468 3.28745 20.9993 3.38538 21.0273C3.48331 21.0554 3.58677 21.058 3.686 21.035L7.221 20.218C7.45967 20.1657 7.70907 20.1975 7.927 20.308C9.19439 20.9304 10.588 21.2527 12 21.25Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ChatsIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M17 2H7C4.23858 2 2 4.23858 2 7V13.8444C2 16.4676 4.02724 18.6448 6.64376 18.8317L8.54496 18.9675C8.83399 18.9881 9.09986 19.1331 9.27372 19.365L10.4 20.8667C11.2 21.9333 12.8 21.9333 13.6 20.8667L14.7 19.4C14.8889 19.1482 15.1852 19 15.5 19H17C19.7614 19 22 16.7614 22 14V7C22 4.23858 19.7614 2 17 2Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const CommentIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 21C13.78 21 15.5201 20.4722 17.0001 19.4832C18.4802 18.4943 19.6337 17.0887 20.3149 15.4442C20.9961 13.7996 21.1743 11.99 20.8271 10.2442C20.4798 8.49836 19.6226 6.89472 18.364 5.63604C17.1053 4.37737 15.5016 3.5202 13.7558 3.17294C12.01 2.82567 10.2004 3.0039 8.55585 3.68509C6.91131 4.36628 5.50571 5.51983 4.51677 6.99987C3.52784 8.47991 3 10.22 3 12C3 13.3622 3.3017 14.6523 3.84373 15.8098C3.94078 16.017 3.97491 16.2493 3.92891 16.4734L3.30483 19.5146C3.16052 20.2178 3.78222 20.8395 4.48544 20.6952L7.52673 20.0711C7.75078 20.0251 7.98295 20.0592 8.19011 20.1561C9.34705 20.6975 10.6387 21 12 21Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ConnectIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12.409 5.8239L9.586 8.5859C9.21106 8.96096 9.00043 9.46957 9.00043 9.9999C9.00043 10.5302 9.21106 11.0388 9.586 11.4139C9.96106 11.7888 10.4697 11.9995 11 11.9995C11.5303 11.9995 12.0389 11.7888 12.414 11.4139L14.124 9.7039C14.3478 9.48 14.6135 9.30239 14.906 9.18121C15.1985 9.06003 15.5119 8.99766 15.8285 8.99766C16.1451 8.99766 16.4585 9.06003 16.751 9.18121C17.0435 9.30239 17.3092 9.48 17.533 9.7039L19.414 11.5859C19.7889 11.961 19.9996 12.4696 19.9996 12.9999C19.9996 13.5302 19.7889 14.0388 19.414 14.4139C21 12.8279 22 11.4999 22 9.4999C22 8.3871 21.6624 7.30048 21.0319 6.38356C20.4013 5.46664 19.5075 4.76256 18.4684 4.3643C17.4293 3.96604 16.2938 3.89234 15.212 4.15294C14.1301 4.41354 13.1528 4.99618 12.409 5.8239ZM19.414 14.4139C19.2168 14.6112 18.9826 14.7676 18.7249 14.8744C18.4672 14.9812 18.191 15.0361 17.912 15.0361C17.633 15.0361 17.3568 14.9812 17.0991 14.8744C16.8414 14.7676 16.6072 14.6112 16.41 14.4139C16.6235 14.607 16.7956 14.8415 16.9157 15.1032C17.0358 15.3648 17.1015 15.6482 17.1087 15.936C17.116 16.2238 17.0646 16.5101 16.9578 16.7774C16.851 17.0448 16.6909 17.2876 16.4873 17.4912C16.2837 17.6948 16.0409 17.8549 15.7735 17.9617C15.5062 18.0685 15.2199 18.1199 14.9321 18.1126C14.6443 18.1054 14.3609 18.0397 14.0993 17.9196C13.8376 17.7995 13.6031 17.6274 13.41 17.4139C13.6074 17.6105 13.7641 17.8441 13.8712 18.1014C13.9782 18.3586 14.0335 18.6344 14.0339 18.9131C14.0342 18.9131 13.9797 19.4677 13.8733 19.7252C13.767 19.9827 13.6109 20.2167 13.414 20.4139C13.224 20.604 12.9976 20.7538 12.7484 20.8544C12.4991 20.9551 12.2322 21.0044 11.9635 20.9996C11.6947 20.9947 11.4297 20.9358 11.1843 20.8262C10.9389 20.7166 10.718 20.5587 10.535 20.3619L5 14.9999C3.5 13.4999 2 11.7999 2 9.4999C2.00022 8.38719 2.33794 7.30071 2.96856 6.38395C3.59917 5.46718 4.49303 4.76325 5.53208 4.36512C6.57112 3.96699 7.7065 3.89337 8.78826 4.154C9.87002 4.41463 10.8473 4.99724 11.591 5.8249C11.7022 5.92823 11.8484 5.98559 12.0002 5.9854C12.152 5.98522 12.2981 5.92751 12.409 5.8239"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const DownIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M7 10L11.875 14.875L16.875 10"
        stroke={strokeColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const EarthIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 4.71C6.78 5.421 8.388 7.363 8.575 9.447C8.75 11.396 10.035 12.98 12 13C12.755 13.008 13.518 12.463 13.516 11.708C13.516 11.475 13.477 11.236 13.417 11.016C13.316 10.6789 13.3456 10.3162 13.5 10C14.11 8.743 15.31 8.405 16.26 7.722C16.681 7.419 17.066 7.099 17.235 6.842C17.704 6.132 18.172 4.711 17.938 4M22 13C21.67 13.931 21.438 16.375 17.718 16.414C17.718 16.414 14.425 16.414 13.437 18.276C12.646 19.766 13.107 21.379 13.437 22"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const GroupIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 13C13.0609 13 14.0783 12.5786 14.8284 11.8284C15.5786 11.0783 16 10.0609 16 9C16 7.93913 15.5786 6.92172 14.8284 6.17157C14.0783 5.42143 13.0609 5 12 5C10.9391 5 9.92172 5.42143 9.17157 6.17157C8.42143 6.92172 8 7.93913 8 9C8 10.0609 8.42143 11.0783 9.17157 11.8284C9.92172 12.5786 10.9391 13 12 13ZM12 13C10.4087 13 8.88258 13.6321 7.75736 14.7574C6.87067 15.6441 6.29016 16.7797 6.08389 18M12 13C13.5913 13 15.1174 13.6321 16.2426 14.7574C17.1293 15.6441 17.7098 16.7797 17.9161 18M13 5C13.404 3.336 15.015 2 17 2C19.172 2 20.98 3.79 21 6C20.98 8.21 19.172 10 17 10M17 10H16M17 10C20.288 10 23 12.686 23 16C23 17.1046 22.1046 18 21 18H17.9161M11 5C10.596 3.336 8.985 2 7 2C4.828 2 3.02 3.79 3 6C3.02 8.21 4.828 10 7 10M7 10H8M7 10C3.712 10 1 12.686 1 16C1 17.1046 1.89543 18 3 18H6.08389M17.9161 18C17.9716 18.3283 18 18.6627 18 19V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V19C6 18.6627 6.02841 18.3283 6.08389 18"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const HomeIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M2 12.204C2 9.915 2 8.771 2.52 7.823C3.038 6.874 3.987 6.286 5.884 5.108L7.884 3.867C9.889 2.622 10.892 2 12 2C13.108 2 14.11 2.622 16.116 3.867L18.116 5.108C20.013 6.286 20.962 6.874 21.481 7.823C22 8.772 22 9.915 22 12.203V13.725C22 17.625 22 19.576 20.828 20.788C19.656 22 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.788C2.001 19.576 2 17.626 2 13.725V12.204Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15V18"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ImagesIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M22 11.0001L20.704 9.70406C20.4809 9.47911 20.2154 9.30056 19.923 9.17872C19.6305 9.05687 19.3168 8.99414 19 8.99414C18.6832 8.99414 18.3695 9.05687 18.077 9.17872C17.7846 9.30056 17.5191 9.47911 17.296 9.70406L11 16.0001"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 8C3.46957 8 2.96086 8.21071 2.58579 8.58579C2.21071 8.96086 2 9.46957 2 10V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H14C14.5304 22 15.0391 21.7893 15.4142 21.4142C15.7893 21.0391 16 20.5304 16 20"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 8C13.5523 8 14 7.55228 14 7C14 6.44772 13.5523 6 13 6C12.4477 6 12 6.44772 12 7C12 7.55228 12.4477 8 13 8Z"
        fill={strokeColor}
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 2H10C8.89543 2 8 2.89543 8 4V14C8 15.1046 8.89543 16 10 16H20C21.1046 16 22 15.1046 22 14V4C22 2.89543 21.1046 2 20 2Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const KebabMenuIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M7 12C7 12.5304 6.78929 13.0391 6.41421 13.4142C6.03914 13.7893 5.53043 14 5 14C4.46957 14 3.96086 13.7893 3.58579 13.4142C3.21071 13.0391 3 12.5304 3 12C3 11.4696 3.21071 10.9609 3.58579 10.5858C3.96086 10.2107 4.46957 10 5 10C5.53043 10 6.03914 10.2107 6.41421 10.5858C6.78929 10.9609 7 11.4696 7 12ZM14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14C11.4696 14 10.9609 13.7893 10.5858 13.4142C10.2107 13.0391 10 12.5304 10 12C10 11.4696 10.2107 10.9609 10.5858 10.5858C10.9609 10.2107 11.4696 10 12 10C12.5304 10 13.0391 10.2107 13.4142 10.5858C13.7893 10.9609 14 11.4696 14 12ZM21 12C21 12.5304 20.7893 13.0391 20.4142 13.4142C20.0391 13.7893 19.5304 14 19 14C18.4696 14 17.9609 13.7893 17.5858 13.4142C17.2107 13.0391 17 12.5304 17 12C17 11.4696 17.2107 10.9609 17.5858 10.5858C17.9609 10.2107 18.4696 10 19 10C19.5304 10 20.0391 10.2107 20.4142 10.5858C20.7893 10.9609 21 11.4696 21 12Z"
        fill={strokeColor}
      />
    </Svg>
  );
};

export const LikeIcon: React.FC<IconProps & { filled?: boolean }> = ({ color, size = 24, style, filled }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M7.5 4C4.4625 4 2 6.4625 2 9.5C2 15 8.5 20 12 21.163C15.5 20 22 15 22 9.5C22 6.4625 19.5375 4 16.5 4C14.64 4 12.995 4.9235 12 6.337C11.4928 5.61469 10.819 5.0252 10.0357 4.61841C9.25238 4.21162 8.38263 3.9995 7.5 4Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? strokeColor : "none"}
      />
    </Svg>
  );
};

export const LocationIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M21.5 12H19.389M19.389 12C19.389 13.9598 18.611 15.8389 17.2252 17.2247C15.8394 18.6105 13.9598 19.389 12 19.389M19.389 12C19.389 10.0402 18.611 8.16013 17.2252 6.77433C15.8394 5.38853 13.9598 4.611 12 4.611M12 2.5V4.611M12 4.611C10.0403 4.611 8.16089 5.38848 6.77519 6.77419C5.38948 8.15989 4.611 10.0393 4.611 11.999C4.611 13.9587 5.38948 15.8381 6.77519 17.2238C8.16089 18.6095 10.0403 19.389 12 19.389M2.5 12H4.611M12 21.5V19.389"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.2221C13.1197 16.2221 14.1936 15.7773 14.9854 14.9855C15.7772 14.1937 16.222 13.1198 16.222 12.0001C16.222 10.8803 15.7772 9.80645 14.9854 9.01467C14.1936 8.22289 13.1197 7.77808 12 7.77808C10.8803 7.77808 9.80637 8.22289 9.0146 9.01467C8.22282 9.80645 7.778 10.8803 7.778 12.0001C7.778 13.1198 8.22282 14.1937 9.0146 14.9855C9.80637 15.7773 10.8803 16.2221 12 16.2221Z"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const MapIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M9 6.639V20.5M15 3V17M3 8.71C3 7.236 3 6.5 3.393 6.07C3.53209 5.91703 3.70129 5.79447 3.89 5.71C4.422 5.474 5.121 5.707 6.519 6.173C7.586 6.529 8.119 6.707 8.659 6.688C8.8571 6.68149 9.05406 6.65536 9.247 6.61C9.772 6.485 10.24 6.173 11.176 5.55L12.558 4.628C13.758 3.828 14.357 3.428 15.045 3.337C15.733 3.244 16.417 3.472 17.784 3.928L18.949 4.316C19.939 4.646 20.434 4.811 20.717 5.204C21 5.597 21 6.12 21 7.162V15.291C21 16.764 21 17.501 20.607 17.931C20.4677 18.0832 20.2985 18.2051 20.11 18.289C19.578 18.526 18.879 18.293 17.481 17.827C16.414 17.471 15.881 17.293 15.341 17.312C15.1429 17.3185 14.9459 17.3446 14.753 17.39C14.228 17.515 13.76 17.827 12.824 18.45L11.442 19.372C10.242 20.172 9.643 20.572 8.955 20.663C8.267 20.756 7.583 20.528 6.216 20.072L5.051 19.684C4.061 19.354 3.566 19.189 3.283 18.796C3 18.403 3 17.88 3 16.838V8.71Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const MarketIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M19 7H5C4.73478 7 4.48043 7.10536 4.29289 7.29289C4.10536 7.48043 4 7.73478 4 8L3 21C3 21.2652 3.10536 21.5196 3.29289 21.7071C3.48043 21.8946 3.73478 22 4 22H20C20.2652 22 20.5196 21.8946 20.7071 21.7071C20.8946 21.5196 21 21.2652 21 21L20 8C20 7.73478 19.8946 7.48043 19.7071 7.29289C19.5196 7.10536 19.2652 7 19 7Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 7V4.5C8 4.1717 8.10346 3.84661 8.30448 3.54329C8.5055 3.23998 8.80014 2.96438 9.17157 2.73223C9.54301 2.50009 9.98396 2.31594 10.4693 2.1903C10.9546 2.06466 11.4747 2 12 2C12.5253 2 13.0454 2.06466 13.5307 2.1903C14.016 2.31594 14.457 2.50009 14.8284 2.73223C15.1999 2.96438 15.4945 3.23998 15.6955 3.54329C15.8965 3.84661 16 4.1717 16 4.5V7"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 10V12.5C8 12.8283 8.10346 13.1534 8.30448 13.4567C8.5055 13.76 8.80014 14.0356 9.17157 14.2678C9.54301 14.4999 9.98396 14.6841 10.4693 14.8097C10.9546 14.9353 11.4747 15 12 15C12.5253 15 13.0454 14.9353 13.5307 14.8097C14.016 14.6841 14.457 14.4999 14.8284 14.2678C15.1999 14.0356 15.4945 13.76 15.6955 13.4567C15.8965 13.1534 16 12.8283 16 12.5V10"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const MenuIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M4 8H20M4 16H20"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const MicIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 19V22M5 10V12C5 13.8565 5.7375 15.637 7.05025 16.9497C8.36301 18.2625 10.1435 19 12 19C13.8565 19 15.637 18.2625 16.9497 16.9497C18.2625 15.637 19 13.8565 19 12V10"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const PlusIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 5V19M5 12H19"
        stroke={strokeColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const RoundTickIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M7 12.7333L10.3333 16L17 9"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const SearchIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M18.1435 18.15L22 22M20.7817 11.375C20.7817 13.8614 19.7923 16.246 18.0312 18.0041C16.2701 19.7623 13.8815 20.75 11.3908 20.75C8.90024 20.75 6.51164 19.7623 4.75052 18.0041C2.98939 16.246 2 13.8614 2 11.375C2 8.8886 2.98939 6.50403 4.75052 4.74587C6.51164 2.98772 8.90024 2 11.3908 2C13.8815 2 16.2701 2.98772 18.0312 4.74587C19.7923 6.50403 20.7817 8.8886 20.7817 11.375Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ShareIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M11.1343 3.45827C10.8697 3.26715 10.5 3.45615 10.5 3.78249L10.5 7.66128C10.5 7.85676 10.354 8.02387 10.1619 8.05984C3.19098 9.36466 3.07203 13.9096 2.00021 19.9999C1.96019 20.238 5.19285 15.3167 10.0961 15.0142C10.318 15.0005 10.5 15.1812 10.5 15.4035L10.5 19.1963C10.5 19.5266 10.8776 19.7146 11.1411 19.5155L21.5691 11.6361C21.7838 11.4739 21.7803 11.1503 21.5623 10.9928L11.1343 3.45827Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const TickIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M4.125 13.125L9.375 18.375L19.875 7.125"
        stroke={strokeColor}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const WaterIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M18.75 15.0001C18.75 19.1424 16.1423 21.7501 12 21.7501C7.85766 21.7501 5.25 19.1424 5.25 15.0001C5.25 10.5549 10.0889 4.55401 11.573 2.81823C11.6258 2.75656 11.6913 2.70705 11.7651 2.6731C11.8388 2.63916 11.919 2.62158 12.0002 2.62158C12.0814 2.62158 12.1617 2.63916 12.2354 2.6731C12.3092 2.70705 12.3747 2.75656 12.4275 2.81823C13.9111 4.55401 18.75 10.5549 18.75 15.0001Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.125 15.375C16.125 16.2701 15.7694 17.1285 15.1365 17.7615C14.5035 18.3944 13.6451 18.75 12.75 18.75"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const LightningIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M13.875 2.625L4.125 13.875L10.875 14.625L10.125 21.375L19.875 10.125L13.125 9.375L13.875 2.625Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const WifiIcon: React.FC<IconProps> = ({ color, size = 24, style }) => {
  const strokeColor = color || '#60646C';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M7.90857 13.7029C8.46601 13.1307 9.13243 12.6758 9.86849 12.3652C10.6046 12.0547 11.3954 11.8947 12.1943 11.8947C12.9932 11.8947 13.784 12.0547 14.5201 12.3652C15.2561 12.6758 15.9226 13.1307 16.48 13.7029M4.18857 10.8058C5.23208 9.7562 6.47279 8.92326 7.83936 8.35488C9.20592 7.7865 10.6714 7.4939 12.1514 7.4939C13.6315 7.4939 15.0969 7.7865 16.4635 8.35488C17.8301 8.92326 19.0708 9.7562 20.1143 10.8058M12.1429 20.9887C12.4378 20.9887 12.7298 20.9306 13.0023 20.8177C13.2747 20.7048 13.5223 20.5394 13.7308 20.3309C13.9393 20.1224 14.1048 19.8748 14.2176 19.6023C14.3305 19.3299 14.3886 19.0378 14.3886 18.7429C14.3886 18.448 14.3305 18.156 14.2176 17.8835C14.1048 17.6111 13.9393 17.3635 13.7308 17.155C13.5223 16.9464 13.2747 16.781 13.0023 16.6682C12.7298 16.5553 12.4378 16.4972 12.1429 16.4972C11.5473 16.4972 10.976 16.7338 10.5549 17.155C10.1337 17.5761 9.89714 18.1473 9.89714 18.7429C9.89714 19.3385 10.1337 19.9097 10.5549 20.3309C10.976 20.7521 11.5473 20.9887 12.1429 20.9887Z"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 7.61722C2.46303 6.15343 4.20013 4.99225 6.11206 4.20001C8.02399 3.40777 10.0733 3 12.1429 3C14.2124 3 16.2617 3.40777 18.1737 4.20001C20.0856 4.99225 21.8227 6.15343 23.2857 7.61722"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
