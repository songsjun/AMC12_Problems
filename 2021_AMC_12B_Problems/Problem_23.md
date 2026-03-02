# 2021 AMC 12B Problem 23

## Problem
Three balls are randomly and independently tossed into bins numbered with the positive integers so that for each ball, the probability that it is tossed into bin i is $2^{-i}$ for $i=1$,2,3,.... More than one ball is allowed in each bin. The probability that the balls end up evenly spaced in distinct bins is $\frac$ pq, where p and q are relatively prime positive integers. (For example, the balls are evenly spaced if they are tossed into bins 3,17, and 10.) What is p+q?

$\textbf{(A) }55 \qquad \textbf{(B) }56 \qquad \textbf{(C) }57\qquad \textbf{(D) }58 \qquad \textbf{(E) }59$
## Solution 1
"Evenly spaced" just means the bins form an arithmetic sequence.

Suppose the middle bin in the sequence is x. There are $x-1$ different possibilities for the first bin, and these two bins uniquely determine the final bin. Now, the probability that these 3 bins are chosen is $6\cdot 2^{-3x} = 6\cdot \frac{1}{8^x},$ so the probability x is the middle bin is $6\cdot\frac{x-1}{8^x}.$ Then, we want the sum

$$
\begin{align*} 6\sum_{x=2}^{\infty}\frac{x-1}{8^x} &= \frac{6}{8}\left[\frac{1}{8} + \frac{2}{8^2} + \frac{3}{8^3}\cdots\right]\\ &= \frac34\left[\left(\frac{1}{8} + \frac{1}{8^2} + \frac{1}{8^3}+\cdots \right) + \left(\frac{1}{8^2} + \frac{1}{8^3} + \frac{1}{8^4} + \cdots \right) + \cdots\right]\\ &= \frac34\left[\frac17\cdot \left(1 + \frac{1}{8} + \frac{1}{8^2} + \frac{1}{8^3} + \cdots \right)\right]\\ &= \frac34\cdot \frac{8}{49}\\ &= \frac{6}{49} \end{align*}
$$

The answer is $6+49=\boxed{\textbf{(A) }55}.$
## Solution 2
As in solution 1, note that "evenly spaced" means the bins are in arithmetic sequence. We let the first bin be a and the common difference be d. Further note that each (a, d) pair uniquely determines a set of 3 bins.

We have $a\geq1$ because the leftmost bin in the sequence can be any bin, and $d\geq1,$ because the bins must be distinct.

This gives us the following sum for the probability:

$$
\begin{align*} 6 \sum_{a=1}^{\infty} \sum_{d=1}^{\infty} 2^{-3a-3d} &= 6 \sum_{a=1}^{\infty} \sum_{d=1}^{\infty} 2^{-3a} \cdot 2^{-3d} \\ &= 6 \left( \sum_{a=1}^{\infty} 2^{-3a} \right) \left( \sum_{d=1}^{\infty} 2^{-3d} \right) \\ &= 6 \left( \sum_{a=1}^{\infty} 8^{-a} \right) \left( \sum_{d=1}^{\infty} 8^{-d} \right) \\ &= 6 \left( \frac{1}{7} \right) \left( \frac{1}{7} \right) \\ &= \frac{6}{49} .\end{align*}
$$

Therefore the answer is 6 + 49 = $\boxed{\textbf{(A) }55}.$

*~Darren Yao*
## Solution 3
This is a slightly messier variant of solution 2. If the first ball is in bin i and the second ball is in bin j>i, then the third ball is in bin $2j$-i. Thus the probability is

$$
\begin{align*} 6\sum_{i=1}^{\infty}\sum_{j=i+1}^\infty2^{-i}2^{-j}2^{-2j+i}&=6\sum_{i=1}^{\infty}\sum_{j=i+1}^\infty2^{-3j}\\ &=6\sum_{i=1}^{\infty}\left(\frac{2^{-3(i+1)}}{1-\tfrac{1}{8}}\right)\\ &=6\sum_{i=1}^\infty\frac{8}{7}\cdot2^{-3}\cdot2^{-3i}\\ &=\frac{6}{7}\sum_{i=1}^\infty2^{-3i}\\ &=\frac{6}{7}\cdot\frac{2^{-3}}{1-\tfrac18}\\ &=\frac{6}{49}. \end{align*}
$$

Therefore the answer is 6 + 49 = $\boxed{\textbf{(A) }55}.$
## Solution 4 (Table)
Based on the value of n, we construct the following table:

$$
\begin{array}{c|c|c|c} & & & \\ [-1.5ex] \textbf{Exactly }\boldsymbol{n}\textbf{ Spaces Apart} & \textbf{Bin \#s} & \textbf{Expression} & \textbf{Prob. of One Such Perm.} \\ [1ex] \hline\hline & & & \\ [-1.5ex] n=1 & 1,2,3 & 2^{-1}\cdot2^{-2}\cdot2^{-3} & 2^{-6} \\ [1ex] & 2,3,4 & 2^{-2}\cdot2^{-3}\cdot2^{-4} & 2^{-9} \\ [1ex] & 3,4,5 & 2^{-3}\cdot2^{-4}\cdot2^{-5} & 2^{-12} \\ [1ex] & 4,5,6 & 2^{-4}\cdot2^{-5}\cdot2^{-6} & 2^{-15} \\ [1ex] & \cdots & \cdots & \cdots \\ [1ex] \hline & & & \\ [-1.5ex] n=2 & 1,3,5 & 2^{-1}\cdot2^{-3}\cdot2^{-5} & 2^{-9} \\ [1ex] & 2,4,6 & 2^{-2}\cdot2^{-4}\cdot2^{-6} & 2^{-12} \\ [1ex] & 3,5,7 & 2^{-3}\cdot2^{-5}\cdot2^{-7} & 2^{-15} \\ [1ex] & 4,6,8 & 2^{-4}\cdot2^{-6}\cdot2^{-8} & 2^{-18} \\ [1ex] & \cdots & \cdots & \cdots \\ [1ex] \hline & & & \\ [-1.5ex] n=3 & 1,4,7 & 2^{-1}\cdot2^{-4}\cdot2^{-7} & 2^{-12} \\ [1ex] & 2,5,8 & 2^{-2}\cdot2^{-5}\cdot2^{-8} & 2^{-15} \\ [1ex] & 3,6,9 & 2^{-3}\cdot2^{-6}\cdot2^{-9} & 2^{-18} \\ [1ex] & 4,7,10 & 2^{-4}\cdot2^{-7}\cdot2^{-10} & 2^{-21} \\ [1ex] & \cdots & \cdots & \cdots \\ [1ex] \hline & & & \\ [-1.5ex] \cdots & \cdots & \cdots & \cdots \\ [1ex] \end{array}
$$

Since three balls have 3!=6 permutations, the requested probability is

$$
\begin{align*} 6\left(\sum_{k=0}^{\infty}2^{-6-3k}+\sum_{k=0}^{\infty}2^{-9-3k}+\sum_{k=0}^{\infty}2^{-12-3k}+\cdots\right)&=6\left(2^{-6}\sum_{k=0}^{\infty}2^{-3k}+2^{-9}\sum_{k=0}^{\infty}2^{-3k}+2^{-12}\sum_{k=0}^{\infty}2^{-3k}+\cdots\right) \\ &=\left(6\sum_{k=0}^{\infty}2^{-3k}\right)\cdot\left(2^{-6}+2^{-9}+2^{-12}+\cdots\right) \\ &=\left(6\sum_{k=0}^{\infty}2^{-3k}\right)\cdot\left(\sum_{k=0}^{\infty}2^{-6-3k}\right) \\ &=\left(6\sum_{k=0}^{\infty}2^{-3k}\right)\cdot\left(2^{-6}\sum_{k=0}^{\infty}2^{-3k}\right) \\ &=\frac{6}{1-2^{-3}}\cdot\frac{2^{-6}}{1-2^{-3}} \\ &=\frac{6}{49} \end{align*}
$$

by infinite geometric series, from which the answer is $6+49=\boxed{\textbf{(A) }55}.$

*~MRENTHUSIASM*
## Video Solution
https://youtu.be/x16YUmd0OqY

*~MathProblemSolvingSkills.com*
## Video Solution by OmegaLearn
https://youtu.be/_IvLCWSSDFs

*~pi_is_3.14*
## Video Solution Using Infinite Geometric Series
https://youtu.be/3B-3_nOTIu4

*~hippopotamus1*
## See Also
