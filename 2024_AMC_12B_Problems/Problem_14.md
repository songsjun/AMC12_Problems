# 2024 AMC 12B Problem 14

> This problem is the same as [2024 AMC 10B #18](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10B_Problems/Problem_18) and [2024 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12B_Problems/Problem_14).
## Problem
How many different remainders can result when the $100$th power of an integer is
divided by $125$?

$\textbf{(A) } 1 \qquad\textbf{(B) } 2 \qquad\textbf{(C) } 5 \qquad\textbf{(D) } 25 \qquad\textbf{(E) } 125$
## Solution 1
First note that the [Euler's totient function](https://artofproblemsolving.com/wiki/index.php/Euler's_totient_function) of $125$ is $100$. We can set up two cases, which depend on whether a number is relatively prime to $125.$

If $n$ is relatively prime to $125$, then $n^{100} \equiv 1 \pmod{125}$ because of [Euler's Totient Theorem](https://artofproblemsolving.com/wiki/index.php/Euler's_Totient_Theorem).

If $n$ is not relatively prime to $125$, it must have a factor of $5$. Express $n$ as $5m$, where $m$ is some integer. Then $n^{100} \equiv (5m)^{100} \equiv 5^{100}\cdot m^{100} \equiv 125 \cdot 5^{97} \cdot m^{100} \equiv 0 \pmod{125}$.

Therefore, $n^{100}$ can only be congruent to $0$ or $1 \pmod{125}$. Our answer is $\boxed{2}$.

*~lprado*
## Sidenote: Proof of Euler's Theorem
Euler's Theorem states that $a^{\phi(n)}\equiv 1\pmod{n}$, where $\phi(n)$ is Euler's totient function, which counts the number of positive integers $x$ such that $\le x \le n$ and $\gcd(x,n)=1$. Note that this only works for positive integer $a$ such that $\gcd(a,n)=1.$

Consider the set of distinct positive integers $S=\{x_1,x_2,\ldots x_{\phi(n)}\}$ such that $\le x_i\le n$ and $\gcd(x_i,n)=1.$ Multiply all terms by $a$ to create $aS=\{ax_1,ax_2,\ldots ax_{\phi(n)}\}.$ First, we prove that $\gcd(ax_i,n)=1$ for any $x_i$ using contradiction. Let $p$ be a prime such that $p \mid ax_i$ and $p \mid n.$ This means that either $p \mid a$ or $p \mid x_i,$ which is not possible since both $\gcd(a,n)$ and $\gcd(x_i,n)=1.$  Next we show that no two elements in set $aS$ are congruent modulo $n.$ Let $x_i$ and $x_j$ exist such that $ax_i\equiv ax_j \pmod{n}.$ Multiplying both sides by $a^{-1}$(which exists) gives $x_i\equiv x_j\pmod{n}.$ This means that if $x_i \not\equiv x_j \pmod{n},$ then $ax_i \not\equiv ax_j \pmod{n}.$ Now we multiply all terms in each set, and note that each residue appears exactly once in both sets, so we have:

$$a^{\phi(n)}\cdot \prod_{i=1}^{\phi(n)} x_i \equiv \prod_{i=1}^{\phi(n)} x_i \pmod{n}.$$

 Because each $x_i$ has the property that $\gcd(x_i,n)=1,$ we must have that $\gcd(\prod_{i=1}^{\phi(n)} x_i,n)=1.$ Then multiplying both sides by the inverse of product thereof gives $a^{\phi(n)}\equiv 1\pmod{n}.\blacksquare$

*~nevergonnagiveup*
## Solution 2 (No Totient)
Note that


$$(5+n)^{100} = {100 \choose 0} 5^{100} + {100 \choose 1} 5^{99} n + {100 \choose 2} 5^{98} n^2 + \cdots + {100 \choose 97} 5^3 n^{97} + {100 \choose 98} 5^2 n^{98} + {100 \choose 99} 5 n^{99} + {100 \choose 100} n^{100}.$$


Taking this mod $125$, we can ignore most of the terms except the for the last $3$:


$${100 \choose 98} 5^2 n^{98} + {100 \choose 99} 5 n^{99} + {100 \choose 100} n^{100} \equiv 4950 \cdot 5^2 n^{98} + 100 \cdot 5 n^{99} + n^{100} \equiv n^{100} \pmod {125},$$


so $(5+n)^{100} \equiv n^{100}$. Substituting $-n$ for $n$, we get $(5-n)^{100} \equiv n^{100}$. Therefore, the remainders when divided by $125$ repeat every $5$ integers, so we only need to check the $100$th powers of $0, 1, 2, 3, 4$. But we have that $(5-1)^{100} \equiv 1^{100}$ and $(5-2)^{100} \equiv 2^{100}$, so we really only need to check $0, 1, 2$. We know that $0, 1$ produce different remainders, so the answer to the problem is either $2$ or $3$. But $3$ is not an answer choice, so the answer is $\boxed{\textbf{(B) } 2}$.
## Solution 3 (Binomial Theorem)
*~Kathan*
[thumb|center|600px|](https://artofproblemsolving.com/wiki/index.php/Image:_2024_AMC_12B_P18.jpeg)
## Solution 4
Firstly, I interpreted the problem algebraically. In other words, let ${x}$ be an integer. Since we're raising it to the ${100}$th power and ${100}$ is even, we don't have to worry about negative values of ${x}$. Now, we break ${125}$ into three factors of ${5}$. I first considered this when we're dividing by ${5}$. Okay so we can write the problem as below:

$x^{100}\equiv r \bmod{5}$. Now, in the world of mod(5), everything is much easier to figure out. Take $x\equiv 0 \bmod{5}$. Now, obviously $x^{100}$ will bring up a remainder of ${0}$ if ${x}$ itself is a multiple of 5. Now, $x\equiv 1 \bmod{5}$. In this case, notice how $1^{100}$ is congruent to 1 in the mod(5) world. So in this case, we would have a remainder of 1. Considering $x\equiv 2 \bmod{5}$, it's a little more tricky. Notice $2^{100}$ is equal to $1024^{10}$ and ${1024}$ is 1 less than a multiple of 5. So ${1024}$ will be congruent to  $-1 \bmod{5}$ and raising it to the power of 10 will bring up a remainder of 1 yet again. Similarly, is $x\equiv 3 \bmod{5}$ or $x\equiv 4 \bmod{5}$, you would notice both these cases will bring up a remainder of 1 again. So in the mod(5) world, we seem to only have remainders of ${0}$ and ${1}$. Interesting!
Therefore, since ${125}$ is just ${3}$ factors of ${5}$, we may say that in mod(125), we would have the same exact remainders namely ${0}$ and ${1}$. Therefore, we would only have ${2}$ possible remainders. This brings an answer of $\boxed{\textbf{(B)} \; 2}$.

*~ilikemath247365*
## Video Solution 1 by Pi Academy (Fast and Easy ⚡🚀)
https://youtu.be/c6nhclB5V1w?feature=shared

*~Pi Academy*
## Video Solution 2 (Fast!)
https://www.youtube.com/watch?v=S7l_Yv2Sd7E
## Video Solution 3 by TheBeautyofMath
https://youtu.be/KhD5-zDNoKM
*Please do not use this unless you have a lot of time and enough brain power to calculate a lot of Totient.

*~IceMatrix ~Marshall_Huang (minor edits)*
## See also
