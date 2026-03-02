# 2014 AMC 12B Problem 20

## Problem
For how many positive integers x is $\log_{10}(x-40) + \log_{10}(60-x) < 2$ ?

$\textbf{(A) }10\qquad \textbf{(B) }18\qquad \textbf{(C) }19\qquad \textbf{(D) }20\qquad \textbf{(E) }\text{infinitely many}\qquad$
## Solution 1
The domain of the LHS implies that 40 Since $\log(a)$ is defined only when a>0.  Begin from the left-hand side $\log_{10}$[(x-40)(60-x)]<2(x-40)(60-x)<$100-x^2+100x-2500<0(x-50)^2>0 x \not = 50$ Hence, we have integers from 41 to 49 and 51 to 59. There are $\boxed{\textbf{(B)} 18}$ integers.
## Solution 2
This solution is similar to the first solution, but perhaps more clear. By the properties of logarithms, $\log_{10}(x-40)+\log_{10}(60-x)=\log_{10}((x-40)(60-x))\implies\log_{10}((x-40)(60-x)).$ Therefore, $(x-40)$(60-x)<100. We can see that this function is concave down (that is, it looks like an upside-down U shape); that is, it has a maximum value. This maximum value is attained at $x=50$, in which $(x-40)$(60-x)=100. This is the one point on the function that does not satisfy the given condition. We also know that, as noted in solution 1, x must be greater than 40 and less than 60, since otherwise, $\log_{10}(x-40)$ or $\log_{10}(60-x)$ would be undefined. Thus, the possible values of x are the positive integers from 41 to 59, inclusive, excluding 50. Thus, there are $19-1=18$ total integers. ~ Technodoggo
## Video Solution by OmegaLearn
https://youtu.be/RdIIEhsbZKw?t=1088 ~ pi_is_3.14
## See also
