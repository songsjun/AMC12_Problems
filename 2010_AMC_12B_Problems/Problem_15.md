# 2010 AMC 12B Problem 15

## Problem
For how many ordered triples (x,y,z) of nonnegative integers less than 20 are there exactly two distinct elements in the set $\{i^x, (1+i)^y, z\}$, where $i=\sqrt{-1}$?

$\textbf{(A)}\ 149 \qquad \textbf{(B)}\ 205 \qquad \textbf{(C)}\ 215 \qquad \textbf{(D)}\ 225 \qquad \textbf{(E)}\ 235$
## Solution
We have either $i^{x}=(1+i)^{y}\neq$ z, $i^{x}=z\neq(1+i)^{y},$ or (1+$i)^{y}=z\neqi^x.$

$i^{x}=(1+i)^{y}$ only occurs when it is 1. (1+$i)^{y}=1$ has only one solution, namely, y=0. $i^{x}=1$ has five solutions between 0 and 19, x=0, x=4, x=8, x=12, and x=16. $z\neq 1$ has nineteen integer solutions between zero and nineteen. So for $i^{x}=(1+i)^{y}\neq$ z, we have $5\cdot 1\cdot 19=95$ ordered triples.

For $i^{x}=z\neq(1+i)^{y},$ again this only occurs at 1. (1+$i)^{y}\neq 1$ has nineteen solutions, $i^{x}=1$ has five solutions, and $z=1$ has one solution, so again we have $5\cdot 1\cdot 19=95$ ordered triples.

For (1+$i)^{y}=z\neqi^x,$ this occurs at 1 and 16. (1+$i)^{y}=1$ and $z=1$ both have one solution while $i^{x}\neq 1$ has fifteen solutions. (1+$i)^{y}=16$ and $z=16$ both have one solution, namely, $y=8$ and $z=16$, while $i^{x}\neq 16$ has twenty solutions $(i^x$ only cycles as 1, i, -1, -i). So we have $15\cdot 1\cdot 1+20\cdot 1\cdot 1=35$ ordered triples.

In total we have {$95+95+35=\boxed{\text{(D) }225}$} ordered triples
## Small Clarification
To more clearly see why the reasoning above is true, try converting the complex numbers into exponential form. That way, we can more easily raise the numbers to x, y and z respectively.
## See also
