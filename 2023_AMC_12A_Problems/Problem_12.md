# 2023 AMC 12A Problem 12

## Problem
What is the value of
$$2^3 - 1^3 + 4^3 - 3^3 + 6^3 - 5^3 + \dots + 18^3 - 17^3?$$

$\textbf{(A) } 2023 \qquad\textbf{(B) } 2679 \qquad\textbf{(C) } 2941 \qquad\textbf{(D) } 3159 \qquad\textbf{(E) } 3235$
## Solution 1
To solve this problem, we will be using difference of cube, sum of squares and sum of arithmetic sequence formulas.

$2^3-1^3+4^3-3^3+6^3-5^3+...+18^3-17^3$


$$=(2-1)(2^2+1 \cdot 2+1^2)+(4-3)(4^2+4 \cdot 3+3^2)+(6-5)(6^2+6 \cdot 5+5^2)+...+(18-17)(18^2+18 \cdot 17+17^2)$$


$$=(2^2+1 \cdot 2+1^2)+(4^2+4 \cdot 3+3^2)+(6^2+6 \cdot 5+5^2)+...+(18^2+18 \cdot 17+17^2)$$


$$=1^2+2^2+3^2+4^2+5^2+6^2...+17^2+18^2+1 \cdot 2+3 \cdot 4+5 \cdot 6+...+17 \cdot 18$$


$$=\frac{18(18+1)(36+1)}{6}+1 \cdot 2+3 \cdot 4+5 \cdot 6+...+17 \cdot 18$$

we could rewrite the second part as $\sum_{n=1}^{9}(2n-1)(2n)$

$$(2n-1)(2n)=4n^2-2n$$

$$\sum_{n=1}^{9}4n^2=4(\frac{9(9+1)(18+1)}{6})$$

$$\sum_{n=1}^{9}-2n=-2(\frac{9(9+1)}{2})$$

Hence,


$$1 \cdot 2+3 \cdot 4+5 \cdot 6+...+17 \cdot 18 = 4(\frac{9(9+1)(18+1)}{6})-2(\frac{9(9+1)}{2})$$


Adding everything up:

$2^3-1^3+4^3-3^3+6^3-5^3+...+18^3-17^3$

$$=\frac{18(18+1)(36+1)}{6}+4(\frac{9(9+1)(18+1)}{6})-2(\frac{9(9+1)}{2})$$

$$=3(19)(37)+6(10)(19)-9(10)$$

$$=2109+1140-90$$

$$=\boxed{\textbf{(D) } 3159}$$

*~lptoggled*
## Solution 2
Think about 2^3+4^3+6^3+...+18^3. Once we factor out $2^3=8,$ we get $1^3+2^3+...+9^3,$ which can be found using the sum of cubes formula, ($\frac{n(n+1)}{2})^2.$ Now think about 1^3+3^3+...+17^3. This is just the previous sum subtracted from the total sum of 18 cubes. So now we have the two things we need to add. The sum of all the even cubes is $8\cdot (\frac{90}{2})^2\rightarrow 8\cdot 2025 = 16200.$ The sum of all cubes from $1^3 to 18^3$ is ($\frac{18\cdot 19}{2})^2=29241.$ The sum of the odd cubes is then $29241-16200=13041$. Thus we get $16200-13041=\boxed{\textbf{(D) } 3159}$
*~amcrunner*
## Solution 2 (a bit faster)
Using the same sum of cubes formula, we can rewrite as $2(2^3 + 4^3 + ... + 18^3)- (1^3 + 2^3 + ... + 18^3)$

$$= 2(2^3)(1^3 + ... + 9^3) - (1^3 + ... + 18^3)$$


$$= 16(5 \cdot 9)^2 - (9 \cdot 19)^2 = 9^2(20^2 - 19^2) = 81 \cdot 39 = \boxed{\textbf{(D) } 3159}$$

*~AoPSuser216*
## Solution 3
For any real numbers x and $y, x^3-y^3=(x-y)(x^2+xy+y^2)=(x-y)((x-y)^2+3xy)=(x-y)^3+3xy(x-y).$

When x = y + 1, with the above formula, we will get $x^3-y^3=1^3+3xy=1 + 3xy.$

Therefore,

$$2^3 - 1^3 + 4^3 - 3^3 + \dots + 18^3 - 17^3$$


$$= (1 + 3\cdot 1\cdot 2) + (1 + 3\cdot 3\cdot 4) + \dots + (1 + 3\cdot 17\cdot 18)$$


$$= 9 + 3\cdot (1\cdot 2 + 3\cdot 4 + \dots + 17\cdot 18)$$

$$= 9 + 3 \cdot (2 + 12 + 30 + 56 + 90 + 132 + 182 + 240 + 306)$$

$$= 9 + 3 \cdot 1050$$

$$= \boxed{\textbf{(D) } 3159}$$

*~sqroot*

Alternatively, to avoid the long sum,


$$(1\cdot 2 + 3\cdot 4 + \dots + 17\cdot 18) \\ = (2^2)(9(10)(19)/6) - (2)(9(10)/2) \\ =(2)(9)(10)(2(19/6) - 1/2) \\ = 180(35/6) = 35(30) = 1050$$

## Solution 4
We rewrite the sum as


$$
\sum_{k=1}^{9}(2k)^3-(2k-1)^3
=\sum_{k=1}^{9} 12k^2 - 6k + 1
=12\sum_{k=1}^{9}k^2 - 6\sum_{k=1}^{9}k + 9
=12\cdot\frac{9\cdot 10\cdot 19}{6} -6\cdot \frac{9\cdot 10}{2} + 9
=3420 - 270 + 9 = \boxed{\textbf{(D) } 3159}
$$


*~Benedict T (countmath1)*
## Solution 4 (answer choices)
We see =$12\cdot\frac{9\cdot 10\cdot 19}{6} -6\cdot \frac{9\cdot 10}{2} + 9 = 9\cdot (12\cdot\frac{10\cdot 19}{6} -6\cdot \frac{10}{2} + 1)$ which is clearly a multiple of 9. The only answer choice which is a multiple of 9 is $\boxed{\textbf{(D) } 3159}$ ~Ilaggo2432
## Solution 5 (Bash)
$$2^3 - 1^3 + 4^3 - 3^3 + 6^3 - 5^3 + \dots + 18^3 - 17^3$$

$$=8-1+64-27+216-125+512-343+1000-729+1728-1331+2744-2197+4096-3375+5832-4913$$

$$= \boxed{\textbf{(D) } 3159}$$
## Solution 6
Reduce all terms mod 9. This yields:


$$
2^3 - 1^3 + 4^3 - 3^3 + 6^3 - 5^3 + \dots + 18^3 - 17^3
\equiv -1 - 1 + 1 - 0 + 0 - -1 + -1 - 1 + 1 - 0 + 0 - -1 + -1 - 1 + 1 - 0 +0 - -1 (\mod 9)
\equiv 0 (\mod 9)
$$


The only answer choice which is also ≡0 mod 9 is = $\boxed{\textbf{(D) } 3159}$
## Video Solution
by Power Solve

https://youtu.be/YXIH3UbLqK8?si=RZhSDIKjRNLrgVS5&t=1552
## Video Solution
https://youtu.be/33Tz-bfKzmw
_~Education, the Study of Everything_
## Video Solution
https://youtu.be/_eoPL5H8b0k

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See also
