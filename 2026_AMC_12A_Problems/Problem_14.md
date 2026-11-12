# 2026 AMC 12A Problem 14

## Problem
Three identical boxes, each with one open face, are made from $1$-inch-thick wood. The outer dimensions of each box are $a, b,$ and $c$ inches, where $a<b<c$, and each open face appears on a face with outer dimensions $b \times c$.

It happens that if the open faces of two of the boxes are held together, then the space inside can exactly contain the (rotated) third box, with no room to spare. What is $a+b+c$?

$\textbf{(A)}~20 \qquad \textbf{(B)}~22 \qquad \textbf{(C)}~24 \qquad \textbf{(D)}~26 \qquad \textbf{(E)}~28$

## Solution 1
Joining two of the boxes creates an enclosed space with dimensions $b-2$, $c-2$, and $2(a-1)=2a-2$, where $b-2<c-2<2a-2$. Because the third box with dimensions $a$, $b$, and $c$ must fill this space perfectly, its largest dimension must equal the largest dimension of the enclosed space.


$$
c=2a-2
$$



The same reasoning applies to the smallest dimension, so


$$
a=b-2
$$



The remaining dimension of the box and the enclosed space must match, so


$$
b=c-2
$$



Solving the system of equations,


$$
(a,b,c)=(6,8,10)\implies a+b+c=\boxed{\textbf{(C)}~24}
$$



~ [Logibyte](https://artofproblemsolving.com/wiki/index.php/Logibyte)

## Solution 2
We can directly find that the dimensions of the inner space are $b-2$, $c-2$, and $2(a-1)=2a-2$. Hence, $\{a,b,c\}=\{b-2,c-2,2a-2\}$.

Notice that $b-2<c-2$, hence the minimal element in the right set is either $b-2$ or $2(a-2)$. In the first case, we have $a=b-2$. Then, either $b=c-2$ or $b=2a-2$. The former yields $a=b-2$, $b=c-2$, and $c=2a-2$, so $(a,b,c)=(6,8,10)$ upon solving. The latter yields $a=b-2$ and $b=2a-2$, but $c=c-2$, impossible. Finally, the second case yields $a=2(a-2)$, so $\{b,c\}=\{b-2,c-2\}$, impossible. Therefore, $(a,b,c)=(6,8,10)$, so the answer is $6+8+10=24$, or $\boxed{\textbf{(C)}}$.

~ [eevee9406](https://artofproblemsolving.com/wiki/index.php/User:Eevee9406)

## Solution 3 (Cheese)
Since the rotated box, when chugged into the $b \times c$ face of the boxes, must have at least 2 dimensions exactly 2 smaller than $b$ and $c$. The 3 side lengths of the box will thus be 3 terms in an arithmetic sequence; the requested sum of the terms is simply thrice the middle term $b$.

The only answer choice that is a multiple of 3 is $\boxed{\textbf{(C)}~24}$.

~megaboy6679

## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
